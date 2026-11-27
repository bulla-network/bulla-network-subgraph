#!/usr/bin/env node
// Deploys the built subgraph (`yarn build:<network>` first) to Goldsky under the next version, reads its
// deployment hash back, and records the build in builds.json (DEV-2996). It moves no tag: once the new
// version has synced, subgraph-promote.js moves dev to it.
//
//   NETWORK=arbitrum GOLDSKY_API_KEY=... node src/scripts/subgraph-deploy.js
//
// Writes `version=<x.y.z>` to $GITHUB_OUTPUT when it's set.

const fs = require("fs");
const { subgraphName, nextVersion, splitEntries, createGoldsky, sleep } = require("./goldsky");
const records = require("./records");

async function deployNext({ network, goldsky, builds, schema, commit, now = () => new Date(), pause = sleep, tries = 40, pollMs = 15000 }) {
  const name = subgraphName(network);
  const { versions } = splitEntries(await goldsky.entries(name));
  const version = nextVersion(versions.map((v) => v.version));
  if (builds[network] && builds[network][version]) {
    throw new Error(`builds.json already has ${network} ${version}, which Goldsky doesn't list. Check the records before deploying.`);
  }

  console.log(`Deploying ${name}/${version} (schema ${schema}, commit ${commit})`);
  goldsky.deploy(name, version);

  // The new version's endpoint can take a moment to answer
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      const entry = splitEntries(await goldsky.entries(name)).versions.find((v) => v.version === version);
      if (entry && entry.graphql_endpoint) {
        const { deployment } = await goldsky.meta(entry.graphql_endpoint);
        return { type: "build", network, version, schema, deployment, commit, deployedAt: now().toISOString() };
      }
      lastError = new Error(`${name}/${version} isn't listed yet`);
    } catch (error) {
      lastError = error;
    }
    await pause(pollMs);
  }
  throw new Error(`Deployed ${name}/${version}, but couldn't read its deployment hash: ${lastError.message}`);
}

async function main() {
  const network = process.env.NETWORK;
  if (!network) throw new Error("NETWORK is not set");
  const build = await deployNext({
    network,
    goldsky: createGoldsky(),
    builds: records.readJson(records.BUILDS),
    schema: records.schemaVersion(),
    commit: records.currentCommit(),
  });
  records.record(build);
  console.log(`Recorded ${network} ${build.version}: deployment ${build.deployment}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${build.version}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { deployNext };
