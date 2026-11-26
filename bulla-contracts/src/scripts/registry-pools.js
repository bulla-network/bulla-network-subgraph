// The factoring pools the subgraph indexes come from the shared pool config, published in
// @bulla/registry (factoring-contracts' pools.json). This repo keeps no pool list of its own, only
// the few registry pools it can't index (EXCLUDED_POOLS): to add, redeploy or drop a pool, change
// factoring-contracts, then bump @bulla/registry here.

const fs = require("fs");

// The template's pool lists, one per pool contract version (registry.schema.json's pool.version).
const POOL_LISTS = {
  V0: "bullaFactoringV0Pools",
  V1: "bullaFactoringV1Pools",
  V2_1: "bullaFactoringV2_1Pools",
  V2_2: "bullaFactoringV2_2Pools",
};

// Pools the registry lists but the subgraph can't index with its version's ABI, by network slug and
// lowercase address, each with its reason. This is the only pool list kept here: everything else in
// the registry is indexed, and a pool listed here that the registry no longer has fails the build.
const EXCLUDED_POOLS = {
  sepolia: {
    // Pre-audit V2.2 test pools with the V2.1 interface: approvedInvoices() doesn't decode with the
    // V2_2 ABI, and the InvoiceFunded/InvoicePaid handlers call it, so indexing them fails the subgraph.
    "0x262d36fa1740dbeec72a88d69b6e1e4888df41ff": "pre-audit V2.2 with the V2.1 interface",
    "0x8ce8fe0c4adf44469f138a8389bda91cc721a515": "pre-audit V2.2 with the V2.1 interface",
    // Pre-release V2.1 test pools: their InvoiceFunded has no fundsReceiver, so it doesn't match the
    // V2_1 data source and the subgraph would see their payments without the fundings.
    "0xd4116f515a6958da851080b390dde4b81f408978": "pre-release V2.1 events",
    "0x1e1d535a41515d3d2c29c1524c825236d67733e1": "pre-release V2.1 events",
  },
};

function loadRegistry() {
  return JSON.parse(fs.readFileSync(require.resolve("@bulla/registry/registry.json"), "utf8"));
}

// Returns { bullaFactoringV0Pools: [...], ... } for the network whose registry slug is `slug`
// (the config file's name, e.g. "arbitrum"). Each entry is { name, address, startBlock }:
// `name` makes the data source name unique, and the pool's deploy block is its start block.
function poolListsFor(registry, slug, excluded = EXCLUDED_POOLS[slug] || {}) {
  if (!Object.values(registry.networks).some((network) => network.slug === slug)) {
    throw new Error(`@bulla/registry has no network with slug "${slug}".`);
  }

  const lists = {};
  for (const listName of Object.values(POOL_LISTS)) lists[listName] = [];

  const pools = registry.pools.filter((p) => p.network === slug);
  for (const address of Object.keys(excluded)) {
    if (!pools.some((p) => p.address.toLowerCase() === address)) {
      throw new Error(`Excluded pool ${address} isn't in @bulla/registry for ${slug}. Remove it from EXCLUDED_POOLS.`);
    }
  }

  const names = new Set();
  for (const pool of pools) {
    if (pool.address.toLowerCase() in excluded) continue;
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

module.exports = { POOL_LISTS, EXCLUDED_POOLS, loadRegistry, poolListsFor };
