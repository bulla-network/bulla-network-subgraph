// The factoring pools the subgraph indexes come from the shared pool config, published in
// @bulla/registry (factoring-contracts' pools.json). This repo keeps no pool list of its own:
// to add, redeploy or drop a pool, change factoring-contracts, then bump @bulla/registry here.

const fs = require("fs");

const readPackageJson = (file) => JSON.parse(fs.readFileSync(require.resolve(`@bulla/registry/${file}`), "utf8"));

// Every pool contract version, from the registry's own schema (pool.version), so a new version
// reaches the template check below without a change here.
const POOL_VERSIONS = readPackageJson("registry.schema.json").definitions.pool.properties.version.enum;

// The template's pool list for a version: V2_2 -> bullaFactoringV2_2Pools.
const poolListName = (version) => `bullaFactoring${version}Pools`;

function loadRegistry() {
  return readPackageJson("registry.json");
}

// The versions template.yaml has no pool list ({{#bullaFactoring<version>Pools}}) for.
function versionsMissingFromTemplate(template, versions = POOL_VERSIONS) {
  return versions.filter((version) => !template.includes(`{{#${poolListName(version)}}}`));
}

// Returns { bullaFactoringV0Pools: [...], ... } for the network whose registry slug is `slug`
// (the config file's name, e.g. "arbitrum"), one list per version. Each entry is
// { name, address, startBlock }: `name` makes the data source name unique, and the pool's deploy
// block is its start block.
function poolListsFor(registry, slug, versions = POOL_VERSIONS) {
  if (!Object.values(registry.networks).some((network) => network.slug === slug)) {
    throw new Error(`@bulla/registry has no network with slug "${slug}".`);
  }

  const lists = Object.fromEntries(versions.map((version) => [poolListName(version), []]));

  const names = new Set();
  for (const pool of registry.pools.filter((p) => p.network === slug)) {
    if (!versions.includes(pool.version)) {
      throw new Error(`@bulla/registry pool ${pool.address} on ${slug} has version ${pool.version}, which its schema doesn't list.`);
    }
    const name = `${pool.client}_${pool.address}`;
    if (names.has(name)) throw new Error(`@bulla/registry lists pool ${pool.address} on ${slug} twice.`);
    names.add(name);
    lists[poolListName(pool.version)].push({ name, address: pool.address, startBlock: pool.deployBlock });
  }

  for (const list of Object.values(lists)) list.sort((a, b) => a.startBlock - b.startBlock);
  return lists;
}

module.exports = { POOL_VERSIONS, poolListName, loadRegistry, versionsMissingFromTemplate, poolListsFor };
