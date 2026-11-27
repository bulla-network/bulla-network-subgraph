const test = require("node:test");
const assert = require("node:assert");
const { nextVersion, splitEntries, readiness } = require("./goldsky");
const { addBuild, setTag } = require("./records");
const { changedNetworks } = require("./changed-networks");
const { deployNext } = require("./subgraph-deploy");
const { promote, tagEndpoint } = require("./subgraph-promote");
const { pendingBuilds, promotePending } = require("./subgraph-promote-pending");

const NAME = "bulla-contracts-arbitrum";
const DEV = "https://example/subgraphs/bulla-contracts-arbitrum/dev/gn";
const synced = { status: "ACTIVE", health: "HEALTHY", synced: true, deployments: [{ fatal_error: null }] };
const syncing = {
  status: "ACTIVE",
  health: "HEALTHY",
  synced: false,
  deployments: [{ fatal_error: null, indexing_progress: { deployment_head_block: 10, chain_head_block: 100, progress_percent: 10 } }],
};

// An in-memory Goldsky: versions { "1.0.1": {...entry} }, tags { dev: "1.0.1" }, deployment hash per version
function fakeGoldsky({ versions = {}, tags = {}, hashes = {} } = {}) {
  const calls = [];
  const state = { versions: { ...versions }, tags: { ...tags } };
  return {
    calls,
    state,
    async entries(name) {
      assert.strictEqual(name, NAME);
      return [
        ...Object.entries(state.versions).map(([version, e]) => ({ version, graphql_endpoint: `v/${version}`, ...e })),
        ...Object.entries(state.tags).map(([tag, target]) => ({ version: tag, tag: { target_version: target } })),
      ];
    },
    async meta(endpoint) {
      const version = endpoint === DEV ? state.tags.dev : endpoint.replace("v/", "");
      return { deployment: hashes[version] };
    },
    deploy(name, version) {
      calls.push(["deploy", version]);
      state.versions[version] = syncing;
    },
    moveTag(name, version, tag) {
      calls.push(["tag", version, tag]);
      state.tags[tag] = version;
    },
    deleteVersion(name, version) {
      calls.push(["delete", version]);
      delete state.versions[version];
    },
  };
}

const noPause = async () => {};
const now = () => new Date("2026-11-27T00:00:00Z");
const builds = { arbitrum: { "1.0.2": { deployment: "Qm2" }, "1.0.3": { deployment: "Qm3" } } };

test("the next version is the highest x.y.z with its patch + 1, ignoring tags", () => {
  assert.strictEqual(nextVersion(["1.0.9", "1.0.10", "0.9.99", "dev", "prod"]), "1.0.11");
  assert.strictEqual(nextVersion([]), "0.0.1");
});

test("entries split into versions and tags", () => {
  const { versions, tags } = splitEntries([
    { version: "1.0.1" },
    { version: "1.0.2", tag: { target_version: "1.0.2" } },
    { version: "dev", tag: { target_version: "1.0.2" } },
  ]);
  assert.deepStrictEqual(versions.map((v) => v.version), ["1.0.1", "1.0.2"]);
  assert.deepStrictEqual(tags, { dev: "1.0.2" });
});

test("a version is ready only when active, healthy and synced", () => {
  assert.strictEqual(readiness(synced).ready, true);
  assert.match(readiness(syncing).reason, /syncing \(10 of 100, 10%\)/);
  assert.strictEqual(readiness({ ...synced, health: "FAILED" }).failed, true);
  assert.strictEqual(readiness({ ...synced, deployments: [{ fatal_error: "boom" }] }).failed, true);
  assert.strictEqual(readiness(undefined).failed, true);
});

test("builds.json refuses a recorded version with another hash, and re-recording is a no-op", () => {
  const b = addBuild({}, { network: "arbitrum", version: "1.0.2", deployment: "Qm2" });
  assert.strictEqual(addBuild(b, { network: "arbitrum", version: "1.0.2", deployment: "Qm2" }), b);
  assert.throws(() => addBuild(b, { network: "arbitrum", version: "1.0.2", deployment: "QmX" }), /not QmX/);
  assert.deepStrictEqual(setTag({}, { network: "arbitrum", tag: "dev", version: "1.0.2", movedAt: "t" }), {
    arbitrum: { dev: { subgraphVersion: "1.0.2", movedAt: "t" } },
  });
});

test("changed networks are those whose manifest renders differently", () => {
  const render = (slug, registry) => `${slug}:${registry[slug]}`;
  assert.deepStrictEqual(changedNetworks({ a: 1, b: 1 }, { a: 1, b: 2 }, ["a", "b"], render), ["b"]);
});

test("deploy uses the next version, moves no tag, and records the hash it reads back", async () => {
  const goldsky = fakeGoldsky({ versions: { "1.0.2": synced }, tags: { dev: "1.0.2" }, hashes: { "1.0.3": "Qm3" } });
  const build = await deployNext({ network: "arbitrum", goldsky, builds: {}, schema: "2.0.0", commit: "abc", now, pause: noPause });
  assert.deepStrictEqual(goldsky.calls, [["deploy", "1.0.3"]]);
  assert.deepStrictEqual(build, {
    type: "build", network: "arbitrum", version: "1.0.3", schema: "2.0.0", deployment: "Qm3", commit: "abc", deployedAt: "2026-11-27T00:00:00.000Z", replaced: [],
  });
});

test("a newer deploy deletes the pending version it replaces, but nothing a tag points to or that isn't recorded", async () => {
  // dev = 1.0.2 (also prod); 1.0.1 is old and untagged but older than dev; 1.0.3 is recorded and still syncing;
  // 1.0.4 was deployed by hand (not recorded)
  const goldsky = fakeGoldsky({
    versions: { "1.0.1": synced, "1.0.2": synced, "1.0.3": syncing, "1.0.4": synced },
    tags: { dev: "1.0.2", prod: "1.0.2" },
    hashes: { "1.0.5": "Qm5" },
  });
  const recorded = { arbitrum: { "1.0.1": {}, "1.0.2": {}, "1.0.3": {} } };
  const build = await deployNext({ network: "arbitrum", goldsky, builds: recorded, schema: "2.0.0", commit: "abc", now, pause: noPause });
  assert.strictEqual(build.version, "1.0.5");
  assert.deepStrictEqual(goldsky.calls, [["deploy", "1.0.5"], ["delete", "1.0.3"]]);
  assert.deepStrictEqual(build.replaced, ["1.0.3"]);
});

test("promote waits for the sync, then moves dev, checks the hash, and deletes the version dev left", async () => {
  const goldsky = fakeGoldsky({ versions: { "1.0.2": synced, "1.0.3": syncing }, tags: { dev: "1.0.2" }, hashes: { "1.0.2": "Qm2", "1.0.3": "Qm3" } });
  let polls = 0;
  const pause = async () => {
    if (++polls === 2) goldsky.state.versions["1.0.3"] = synced; // synced on the second check
  };
  const result = await promote({ network: "arbitrum", version: "1.0.3", tag: "dev", goldsky, builds, endpoint: DEV, prune: true, waitMs: 1e9, now, pause, log: () => {} });
  assert.deepStrictEqual(goldsky.calls, [["tag", "1.0.3", "dev"], ["delete", "1.0.2"]]);
  assert.deepStrictEqual(result.record, { type: "tag", network: "arbitrum", tag: "dev", version: "1.0.3", movedAt: "2026-11-27T00:00:00.000Z" });
});

test("promote never moves the tag while the version is syncing, and fails when the wait runs out", async () => {
  const goldsky = fakeGoldsky({ versions: { "1.0.3": syncing }, tags: { dev: "1.0.2" } });
  await assert.rejects(
    promote({ network: "arbitrum", version: "1.0.3", tag: "dev", goldsky, builds, endpoint: DEV, waitMs: 0, pause: noPause, log: () => {} }),
    (error) => error.code === "NOT_READY" && /isn't ready to serve dev: syncing/.test(error.message)
  );
  assert.deepStrictEqual(goldsky.calls, []);
});

test("promote fails at once on a failed version, and refuses one builds.json doesn't have", async () => {
  const goldsky = fakeGoldsky({ versions: { "1.0.3": { ...synced, health: "FAILED" } }, tags: { dev: "1.0.2" } });
  await assert.rejects(promote({ network: "arbitrum", version: "1.0.3", tag: "dev", goldsky, builds, endpoint: DEV, waitMs: 1e9, pause: noPause }), /failed/);
  await assert.rejects(promote({ network: "arbitrum", version: "9.9.9", tag: "dev", goldsky, builds, endpoint: DEV }), /builds.json has no arbitrum 9.9.9/);
  assert.deepStrictEqual(goldsky.calls, []);
});

test("promote keeps the version dev left while prod still points to it", async () => {
  const goldsky = fakeGoldsky({ versions: { "1.0.2": synced, "1.0.3": synced }, tags: { dev: "1.0.2", prod: "1.0.2" }, hashes: { "1.0.3": "Qm3" } });
  const result = await promote({ network: "arbitrum", version: "1.0.3", tag: "dev", goldsky, builds, endpoint: DEV, prune: true, pause: noPause, log: () => {} });
  assert.deepStrictEqual(goldsky.calls, [["tag", "1.0.3", "dev"]]);
  assert.strictEqual(result.deleted, null);
});

test("promote fails when the tag doesn't serve the recorded deployment", async () => {
  const goldsky = fakeGoldsky({ versions: { "1.0.3": synced }, tags: { dev: "1.0.2" }, hashes: { "1.0.3": "QmOther" } });
  await assert.rejects(
    promote({ network: "arbitrum", version: "1.0.3", tag: "dev", goldsky, builds, endpoint: DEV, verifyTries: 2, pause: noPause, log: () => {} }),
    /serves QmOther, not Qm3/
  );
});

test("the tag endpoints come from the registry", () => {
  const registry = { networks: { 42161: { slug: "arbitrum", subgraph: { dev: "d", prod: "p" } } } };
  assert.strictEqual(tagEndpoint(registry, "arbitrum", "prod"), "p");
  assert.throws(() => tagEndpoint(registry, "nowhere", "dev"), /no dev endpoint for nowhere/);
});

test("pending builds are each network's newest recorded build that dev doesn't have yet", () => {
  const recorded = { arbitrum: { "1.0.9": {}, "1.0.10": {} }, base: { "1.0.4": {} }, mainnet: { "1.0.2": {} } };
  const deployments = { base: { dev: { subgraphVersion: "1.0.4" } }, mainnet: { dev: { subgraphVersion: "1.0.1" } } };
  assert.deepStrictEqual(pendingBuilds(recorded, deployments), { arbitrum: "1.0.10", mainnet: "1.0.2" });
});

test("Promote Pending moves dev where the build has synced, waits where it's syncing, and reports failures", async () => {
  const recorded = { arbitrum: { "1.0.3": {} }, base: { "1.0.4": {} }, mainnet: { "1.0.2": {} } };
  const seen = [];
  const promoteImpl = async ({ network, version, tag, prune, waitMs }) => {
    seen.push([network, version, tag, prune, waitMs]);
    if (network === "arbitrum") throw Object.assign(new Error("syncing (10%)."), { code: "NOT_READY" });
    if (network === "mainnet") throw Object.assign(new Error("failed: boom."), { code: "FAILED" });
    return { record: { type: "tag", network, tag, version } };
  };
  const logs = [];
  const { moved, failed } = await promotePending({ builds: recorded, deployments: {}, goldsky: {}, endpointFor: (n) => n, promoteImpl, log: (m) => logs.push(m) });
  assert.deepStrictEqual(seen, [["arbitrum", "1.0.3", "dev", true, 0], ["base", "1.0.4", "dev", true, 0], ["mainnet", "1.0.2", "dev", true, 0]]);
  assert.deepStrictEqual(moved, [{ type: "tag", network: "base", tag: "dev", version: "1.0.4" }]);
  assert.deepStrictEqual(failed, ["mainnet: failed: boom."]);
  assert.ok(logs.some((l) => /arbitrum: syncing \(10%\)\. Checking again next run\./.test(l)));
});
