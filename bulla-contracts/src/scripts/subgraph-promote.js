#!/usr/bin/env node
// Moves a tag (dev or prod) to a deployed subgraph version, once that version has synced (DEV-2996,
// DEV-2997). In order, it:
//
//   1. refuses a version builds.json doesn't have;
//   2. waits until Goldsky reports the version synced and healthy (up to WAIT_MINUTES, default 0: check
//      once), and fails on a failed version, so a tag never points at a half-indexed build. A long sync
//      (Arbitrum takes about a day) is left to Promote Pending, which checks every hour;
//   3. moves the tag, then checks that the tag's endpoint serves the deployment builds.json recorded;
//   4. records the move in deployments.json;
//   5. with PRUNE=true, deletes the version the tag pointed to before, unless another tag still points
//      to it (prod usually does, and so may the legacy v2-main and latest).
//
//   NETWORK=arbitrum VERSION=1.0.7 TAG=dev WAIT_MINUTES=330 PRUNE=true GOLDSKY_API_KEY=... \
//     node src/scripts/subgraph-promote.js

const { subgraphName, splitEntries, readiness, createGoldsky, sleep } = require("./goldsky");
const { loadRegistry } = require("./registry-pools");
const records = require("./records");

// code: FAILED (the version failed) or NOT_READY (still syncing), so Promote Pending can tell them apart
function promoteError(code, message) {
  return Object.assign(new Error(message), { code });
}

// The endpoint consumers read a tag through, from @bulla/registry (networks[chainId].subgraph[tag])
function tagEndpoint(registry, network, tag) {
  const entry = Object.values(registry.networks).find((n) => n.slug === network);
  const endpoint = entry && entry.subgraph && entry.subgraph[tag];
  if (!endpoint) throw new Error(`@bulla/registry has no ${tag} endpoint for ${network}`);
  return endpoint;
}

async function promote({
  network,
  version,
  tag,
  goldsky,
  builds,
  endpoint,
  prune = false,
  waitMs = 0,
  pollMs = 5 * 60 * 1000,
  verifyTries = 20,
  verifyPollMs = 15000,
  now = () => new Date(),
  pause = sleep,
  log = console.log,
}) {
  const name = subgraphName(network);
  const build = builds[network] && builds[network][version];
  if (!build) throw new Error(`builds.json has no ${network} ${version}. Deploy it with the Deploy workflow first.`);

  // 2. Wait for the version to sync
  const started = Date.now();
  let state;
  for (;;) {
    state = splitEntries(await goldsky.entries(name));
    const status = readiness(state.versions.find((v) => v.version === version));
    if (status.ready) break;
    if (status.failed) throw promoteError("FAILED", `${name}/${version} ${status.reason}. ${tag} stays where it is.`);
    if (Date.now() - started >= waitMs) {
      throw promoteError("NOT_READY", `${name}/${version} isn't ready to serve ${tag}: ${status.reason}.`);
    }
    log(`${name}/${version}: ${status.reason}; checking again in ${Math.round(pollMs / 60000)} min`);
    await pause(pollMs);
  }

  // 3. Move the tag and check what it serves
  const previous = state.tags[tag];
  if (previous === version) log(`${tag} already points to ${version}`);
  else {
    log(`Moving ${name} ${tag}: ${previous || "(none)"} -> ${version}`);
    goldsky.moveTag(name, version, tag);
  }

  let served;
  for (let i = 0; i < verifyTries; i++) {
    try {
      served = (await goldsky.meta(endpoint)).deployment;
      if (served === build.deployment) break;
    } catch (error) {
      served = `error: ${error.message}`;
    }
    await pause(verifyPollMs);
  }
  if (served !== build.deployment) {
    throw new Error(`${tag} now points to ${name}/${version}, but ${endpoint} serves ${served}, not ${build.deployment}`);
  }

  // 4. The record
  const record = { type: "tag", network, tag, version, movedAt: now().toISOString() };

  // 5. Delete the version the tag left, if nothing else points to it
  let deleted = null;
  if (prune && previous && previous !== version) {
    const stillTagged = Object.entries(splitEntries(await goldsky.entries(name)).tags)
      .filter(([, target]) => target === previous)
      .map(([t]) => t);
    if (stillTagged.length > 0) log(`Keeping ${name}/${previous}: ${stillTagged.join(", ")} still point to it`);
    else {
      log(`Deleting ${name}/${previous}: no tag points to it any more`);
      goldsky.deleteVersion(name, previous);
      deleted = previous;
    }
  }

  return { record, previous, deleted };
}

async function main() {
  const { NETWORK: network, VERSION: version, TAG: tag } = process.env;
  if (!network || !version || !tag) throw new Error("NETWORK, VERSION and TAG must be set");
  if (!["dev", "prod"].includes(tag)) throw new Error(`TAG must be dev or prod, not ${tag}`);
  const { record } = await promote({
    network,
    version,
    tag,
    goldsky: createGoldsky(),
    builds: records.readJson(records.BUILDS),
    endpoint: tagEndpoint(loadRegistry(), network, tag),
    prune: process.env.PRUNE === "true",
    waitMs: Number(process.env.WAIT_MINUTES || 0) * 60 * 1000,
  });
  records.record(record);
  console.log(`Recorded ${network} ${tag} -> ${version}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { promote, tagEndpoint, promoteError };
