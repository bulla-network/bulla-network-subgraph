// Goldsky access for the Deploy and Promote scripts. Reads go through the REST API
// (https://docs.goldsky.com/api-reference); deploying, tagging and deleting go through the goldsky
// CLI, as the existing deploy and tag scripts do. Both use GOLDSKY_API_KEY.
//
// Goldsky never overwrites a version: deploying an existing name/version doesn't replace it (the API's
// `overwrite` is deprecated, and 1 is rejected). Every deploy uses a new version. `subgraph tag create`
// moves a tag that already exists.

const { execFileSync } = require("child_process");

const API = "https://api.goldsky.com/api/v1";

const subgraphName = (network) => `bulla-contracts-${network}`;

// "1.0.12" -> [1, 0, 12]; anything else (a tag such as "dev") -> null
function parseVersion(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  return m ? m.slice(1).map(Number) : null;
}

const compareVersions = (a, b) => {
  const [x, y] = [parseVersion(a), parseVersion(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

// The next version to deploy: the highest x.y.z with its patch + 1, or 0.0.1 for a new subgraph
function nextVersion(versions) {
  const numbered = versions.filter(parseVersion).sort(compareVersions);
  if (numbered.length === 0) return "0.0.1";
  const [major, minor, patch] = parseVersion(numbered[numbered.length - 1]);
  return `${major}.${minor}.${patch + 1}`;
}

// The API lists a subgraph's versions and its tags together. A tag is an entry whose tag.target_version
// names another entry.
function splitEntries(entries) {
  const isTag = (e) => e.tag && e.tag.target_version && e.tag.target_version !== e.version;
  return {
    versions: entries.filter((e) => !isTag(e)),
    tags: Object.fromEntries(entries.filter(isTag).map((e) => [e.version, e.tag.target_version])),
  };
}

// A version is ready to serve a tag once it's active, healthy and synced, with no fatal error
function readiness(entry) {
  if (!entry) return { ready: false, failed: true, reason: "not deployed" };
  const latest = (entry.deployments || [])[0] || {};
  if (entry.health === "FAILED" || latest.fatal_error) {
    return { ready: false, failed: true, reason: `failed: ${latest.fatal_error || entry.health}` };
  }
  const progress = latest.indexing_progress;
  const at = progress ? ` (${progress.deployment_head_block} of ${progress.chain_head_block}, ${progress.progress_percent}%)` : "";
  if (entry.status !== "ACTIVE") return { ready: false, failed: false, reason: `status ${entry.status}${at}` };
  if (!entry.synced) return { ready: false, failed: false, reason: `syncing${at}` };
  if (entry.health !== "HEALTHY") return { ready: false, failed: false, reason: `health ${entry.health}${at}` };
  return { ready: true, failed: false, reason: "synced and healthy" };
}

function createGoldsky({ apiKey = process.env.GOLDSKY_API_KEY, fetchImpl = fetch, run = runCli } = {}) {
  if (!apiKey) throw new Error("GOLDSKY_API_KEY is not set");

  async function get(path) {
    const res = await fetchImpl(`${API}${path}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) throw new Error(`Goldsky API GET ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  return {
    // Every entry (versions and tags) of a subgraph, across all pages
    async entries(name) {
      const all = [];
      let token = null;
      do {
        const page = await get(`/subgraphs/${name}?page_size=100${token ? `&page_token=${encodeURIComponent(token)}` : ""}`);
        all.push(...page.data);
        token = page.pagination && page.pagination.next_page_token;
      } while (token);
      return all;
    },

    // What an endpoint serves: its deployment hash and block
    async meta(endpoint) {
      const res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ _meta { deployment hasIndexingErrors block { number } } }" }),
      });
      if (!res.ok) throw new Error(`${endpoint}: ${res.status} ${await res.text()}`);
      const body = await res.json();
      if (!body.data || !body.data._meta) throw new Error(`${endpoint}: no _meta in ${JSON.stringify(body)}`);
      return body.data._meta;
    },

    deploy: (name, version) => run(["subgraph", "deploy", `${name}/${version}`]),
    moveTag: (name, version, tag) => run(["subgraph", "tag", "create", `${name}/${version}`, "--tag", tag]),
    deleteVersion: (name, version) => run(["subgraph", "delete", `${name}/${version}`, "--force"]),
  };
}

function runCli(args) {
  const token = process.env.GOLDSKY_API_KEY ? ["--token", process.env.GOLDSKY_API_KEY] : [];
  execFileSync("goldsky", [...args, ...token], { stdio: ["ignore", "inherit", "inherit"] });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { subgraphName, parseVersion, compareVersions, nextVersion, splitEntries, readiness, createGoldsky, sleep };
