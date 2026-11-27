// Renders template.yaml for one network: its contracts from its config file (config/<slug>.json),
// and its factoring pools from a @bulla/registry registry.json. Rendering takes the registry as an
// argument, so two registry versions can be compared (changed-networks.js).

const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const { POOL_VERSIONS, poolListName, loadRegistry, versionsMissingFromTemplate, poolListsFor } = require("./registry-pools");

const ROOT = path.join(__dirname, "..", "..");
const CONFIG_DIR = path.join(ROOT, "config");
const TEMPLATE_PATH = path.join(ROOT, "template.yaml");

// The networks there's a config file for: their slugs, e.g. "arbitrum".
function networkSlugs() {
  return fs
    .readdirSync(CONFIG_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.basename(f, ".json"))
    .sort();
}

// Throws on a config or template the pools can't be rendered into.
function renderManifest({ config, template, slug, registry = loadRegistry(), versions = POOL_VERSIONS }) {
  const view = { ...config };

  // The latest start block across the config's contracts
  view.latestStartBlock = 0;
  for (const value of Object.values(config)) {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof value.startBlock === "number") {
      view.latestStartBlock = Math.max(view.latestStartBlock, value.startBlock);
    }
  }

  // The factoring pools come from @bulla/registry, not from the config file.
  for (const version of versions) {
    if (poolListName(version) in config) {
      throw new Error(`config/${slug}.json: remove "${poolListName(version)}". The pools come from @bulla/registry (see src/scripts/registry-pools.js).`);
    }
  }

  // Every version the registry has needs its data source in the template, or its pools would be dropped silently.
  const missing = versionsMissingFromTemplate(template, versions);
  if (missing.length > 0) {
    throw new Error(`template.yaml: no data source for pool version ${missing.join(", ")}. Add a {{#${poolListName(missing[0])}}} section.`);
  }

  // Mustache can't reach the top-level network and apiVersion from inside a list, so copy them in.
  for (const [listName, pools] of Object.entries(poolListsFor(registry, slug, versions))) {
    view[listName] = pools.map((pool) => ({ ...pool, network: config.network, apiVersion: config.apiVersion }));
  }

  return mustache.render(template, view);
}

// The manifest for a network from the files in this repo.
function renderNetwork(slug, registry = loadRegistry()) {
  const config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, `${slug}.json`), "utf8"));
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  return renderManifest({ config, template, slug, registry });
}

module.exports = { networkSlugs, renderManifest, renderNetwork };
