// The factoring pools the subgraph indexes come from the shared pool config, published in
// @bulla/registry (factoring-contracts' pools.json). This repo keeps no pool list of its own:
// to add, redeploy or drop a pool, change factoring-contracts, then bump @bulla/registry here.

const fs = require("fs");

// The template's pool lists, one per pool contract version (registry.schema.json's pool.version).
const POOL_LISTS = {
  V0: "bullaFactoringV0Pools",
  V1: "bullaFactoringV1Pools",
  V2_1: "bullaFactoringV2_1Pools",
  V2_2: "bullaFactoringV2_2Pools",
};

function loadRegistry() {
  return JSON.parse(fs.readFileSync(require.resolve("@bulla/registry/registry.json"), "utf8"));
}

// Returns { bullaFactoringV0Pools: [...], ... } for the network whose registry slug is `slug`
// (the config file's name, e.g. "arbitrum"). Each entry is { name, address, startBlock }:
// `name` makes the data source name unique, and the pool's deploy block is its start block.
function poolListsFor(registry, slug) {
  if (!Object.values(registry.networks).some((network) => network.slug === slug)) {
    throw new Error(`@bulla/registry has no network with slug "${slug}".`);
  }

  const lists = {};
  for (const listName of Object.values(POOL_LISTS)) lists[listName] = [];

  const names = new Set();
  for (const pool of registry.pools.filter((p) => p.network === slug)) {
    const listName = POOL_LISTS[pool.version];
    if (!listName) {
      throw new Error(
        `@bulla/registry pool ${pool.address} on ${slug} has version ${pool.version}, which template.yaml has no data source for.`
      );
    }
    const name = `${pool.client}_${pool.address}`;
    if (names.has(name)) throw new Error(`@bulla/registry lists pool ${pool.address} on ${slug} twice.`);
    names.add(name);
    lists[listName].push({ name, address: pool.address, startBlock: pool.deployBlock });
  }

  for (const list of Object.values(lists)) list.sort((a, b) => a.startBlock - b.startBlock);
  return lists;
}

module.exports = { POOL_LISTS, loadRegistry, poolListsFor };
