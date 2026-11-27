#!/usr/bin/env node
// Lists the networks whose subgraph manifest differs between two @bulla/registry versions, so a
// registry bump redeploys only those (DEV-3178). Every redeploy re-indexes its chain from scratch.
//
//   node src/scripts/changed-networks.js <before/registry.json> [after/registry.json]
//
// `after` defaults to the installed @bulla/registry. Prints a JSON array of slugs, e.g. ["arbitrum"].

const fs = require("fs");
const { networkSlugs, renderNetwork } = require("./manifest");
const { loadRegistry } = require("./registry-pools");

function changedNetworks(before, after, slugs = networkSlugs(), render = renderNetwork) {
  return slugs.filter((slug) => render(slug, before) !== render(slug, after));
}

if (require.main === module) {
  const [beforePath, afterPath] = process.argv.slice(2);
  if (!beforePath) {
    console.error("Usage: node changed-networks.js <before/registry.json> [after/registry.json]");
    process.exit(1);
  }
  const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
  const after = afterPath ? read(afterPath) : loadRegistry();
  console.log(JSON.stringify(changedNetworks(read(beforePath), after)));
}

module.exports = { changedNetworks };
