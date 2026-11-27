#!/usr/bin/env node
// Run every hour (Promote Pending workflow). For each network whose newest recorded build isn't what
// deployments.json has behind dev, it tries to move dev to that build (subgraph-promote.js, no waiting):
//
//   - still syncing: logs its progress and leaves dev alone; the next run checks again. A sync can take
//     as long as it needs (Arbitrum takes about a day), with no job waiting on it;
//   - synced and healthy: moves dev, checks the served hash, records the move, and deletes the version
//     dev left unless another tag still points to it;
//   - failed: leaves dev alone and fails the run, so someone looks at it.
//
//   GOLDSKY_API_KEY=... node src/scripts/subgraph-promote-pending.js

const { parseVersion, compareVersions, createGoldsky } = require("./goldsky");
const { loadRegistry } = require("./registry-pools");
const { promote, tagEndpoint } = require("./subgraph-promote");
const records = require("./records");

// network -> the newest recorded build, for the networks where dev doesn't have it yet
function pendingBuilds(builds, deployments) {
  const pending = {};
  for (const [network, versions] of Object.entries(builds)) {
    const newest = Object.keys(versions).filter(parseVersion).sort(compareVersions).pop();
    const dev = deployments[network] && deployments[network].dev && deployments[network].dev.subgraphVersion;
    if (newest && newest !== dev) pending[network] = newest;
  }
  return pending;
}

async function promotePending({ builds, deployments, goldsky, endpointFor, promoteImpl = promote, log = console.log }) {
  const moved = [];
  const failed = [];
  for (const [network, version] of Object.entries(pendingBuilds(builds, deployments))) {
    try {
      const { record } = await promoteImpl({ network, version, tag: "dev", goldsky, builds, endpoint: endpointFor(network), prune: true, waitMs: 0, log });
      moved.push(record);
      log(`${network}: dev -> ${version}`);
    } catch (error) {
      if (error.code === "NOT_READY") log(`${network}: ${error.message} Checking again next run.`);
      else failed.push(`${network}: ${error.message}`);
    }
  }
  return { moved, failed };
}

async function main() {
  const registry = loadRegistry();
  const { moved, failed } = await promotePending({
    builds: records.readJson(records.BUILDS),
    deployments: records.readJson(records.DEPLOYMENTS),
    goldsky: createGoldsky(),
    endpointFor: (network) => tagEndpoint(registry, network, "dev"),
  });
  for (const record of moved) records.record(record);
  if (moved.length === 0) console.log("No pending build is ready to move dev to.");
  if (failed.length > 0) {
    console.error(`Couldn't move dev:\n  ${failed.join("\n  ")}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { pendingBuilds, promotePending };
