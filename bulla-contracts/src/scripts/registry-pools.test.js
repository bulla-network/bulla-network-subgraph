const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { POOL_VERSIONS, poolListName, loadRegistry, versionsMissingFromTemplate, poolListsFor } = require("./registry-pools");

const configDir = path.join(__dirname, "..", "..", "config");
const slugs = fs.readdirSync(configDir).filter((f) => f.endsWith(".json")).map((f) => path.basename(f, ".json"));
const registry = loadRegistry();

const fakeRegistry = (pools) => ({ networks: { 1: { slug: "mainnet" } }, pools });
const pool = (address, version, deployBlock = 1) => ({ network: "mainnet", client: "tcs", address, version, deployBlock });

test("every network config has exactly its registry pools", () => {
  for (const slug of slugs) {
    const lists = poolListsFor(registry, slug);
    const indexed = Object.values(lists).flat().map((p) => p.address.toLowerCase()).sort();
    const expected = registry.pools
      .filter((p) => p.network === slug)
      .map((p) => p.address.toLowerCase())
      .sort();
    assert.deepStrictEqual(indexed, expected, slug);
  }
});

test("config files keep no pool lists", () => {
  for (const slug of slugs) {
    const config = JSON.parse(fs.readFileSync(path.join(configDir, `${slug}.json`), "utf8"));
    for (const version of POOL_VERSIONS) assert.ok(!(poolListName(version) in config), `${slug}.json has ${poolListName(version)}`);
  }
});

test("each pool goes to its version's list, starting at its deploy block", () => {
  const lists = poolListsFor(fakeRegistry([pool("0xB", "V2_2", 20), pool("0xA", "V1", 10)]), "mainnet");
  assert.deepStrictEqual(lists.bullaFactoringV1Pools, [{ name: "tcs_0xA", address: "0xA", startBlock: 10 }]);
  assert.deepStrictEqual(lists.bullaFactoringV2_2Pools, [{ name: "tcs_0xB", address: "0xB", startBlock: 20 }]);
  assert.deepStrictEqual(lists.bullaFactoringV0Pools, []);
});

test("the versions come from the registry schema, and template.yaml has a data source for each", () => {
  assert.deepStrictEqual(POOL_VERSIONS, ["V0", "V1", "V2_1", "V2_2"]);
  assert.strictEqual(poolListName("V2_2"), "bullaFactoringV2_2Pools");
  const template = fs.readFileSync(path.join(__dirname, "..", "..", "template.yaml"), "utf8");
  assert.deepStrictEqual(versionsMissingFromTemplate(template), []);
  assert.deepStrictEqual(versionsMissingFromTemplate(template, [...POOL_VERSIONS, "V3"]), ["V3"]);
});

test("a pool whose version the schema doesn't list fails", () => {
  assert.throws(() => poolListsFor(fakeRegistry([pool("0xA", "V3")]), "mainnet"), /version V3/);
});

test("a new version gets its own list", () => {
  const lists = poolListsFor(fakeRegistry([pool("0xA", "V3")]), "mainnet", [...POOL_VERSIONS, "V3"]);
  assert.deepStrictEqual(lists.bullaFactoringV3Pools.map((p) => p.address), ["0xA"]);
});

test("a network the registry doesn't have fails", () => {
  assert.throws(() => poolListsFor(fakeRegistry([]), "nowhere"), /no network with slug "nowhere"/);
});
