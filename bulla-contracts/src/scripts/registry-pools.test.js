const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { POOL_LISTS, loadRegistry, poolListsFor } = require("./registry-pools");

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
    for (const listName of Object.values(POOL_LISTS)) assert.ok(!(listName in config), `${slug}.json has ${listName}`);
  }
});

test("each pool goes to its version's list, starting at its deploy block", () => {
  const lists = poolListsFor(fakeRegistry([pool("0xB", "V2_2", 20), pool("0xA", "V1", 10)]), "mainnet");
  assert.deepStrictEqual(lists.bullaFactoringV1Pools, [{ name: "tcs_0xA", address: "0xA", startBlock: 10 }]);
  assert.deepStrictEqual(lists.bullaFactoringV2_2Pools, [{ name: "tcs_0xB", address: "0xB", startBlock: 20 }]);
  assert.deepStrictEqual(lists.bullaFactoringV0Pools, []);
});

test("a version the template has no data source for fails", () => {
  assert.throws(() => poolListsFor(fakeRegistry([pool("0xA", "V3")]), "mainnet"), /version V3/);
});

test("a network the registry doesn't have fails", () => {
  assert.throws(() => poolListsFor(fakeRegistry([]), "nowhere"), /no network with slug "nowhere"/);
});
