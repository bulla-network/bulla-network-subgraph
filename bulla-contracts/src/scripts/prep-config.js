#!/usr/bin/env node
/**
 * Renders template.yaml for one network: its contracts from the config file, and its factoring pools
 * from @bulla/registry. Mustache can't reach the parent context from inside a list, so the top-level
 * network and apiVersion are copied into each pool entry.
 */

const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const configPath = process.argv[2];
const templatePath = process.argv[3];
const outputPath = process.argv[4];

if (!configPath || !templatePath || !outputPath) {
  console.error('Usage: node prep-config.js <config.json> <template.yaml> <output.yaml>');
  process.exit(1);
}

// Read config and template
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

// Compute the latest (max) startBlock across all config entries
let latestStartBlock = 0;
for (const [key, value] of Object.entries(config)) {
  if (value && typeof value === 'object' && !Array.isArray(value) && typeof value.startBlock === 'number') {
    if (value.startBlock > latestStartBlock) {
      latestStartBlock = value.startBlock;
    }
  }
}
config.latestStartBlock = latestStartBlock;

// The factoring pools come from @bulla/registry, not from the config file.
const { POOL_VERSIONS, poolListName, loadRegistry, versionsMissingFromTemplate, poolListsFor } = require('./registry-pools');

for (const version of POOL_VERSIONS) {
  if (poolListName(version) in config) {
    console.error(`${configPath}: remove "${poolListName(version)}". The pools come from @bulla/registry (see src/scripts/registry-pools.js).`);
    process.exit(1);
  }
}

// Every version the registry has needs its data source in the template, or its pools would be dropped silently.
const missing = versionsMissingFromTemplate(template);
if (missing.length > 0) {
  console.error(`${templatePath}: no data source for pool version ${missing.join(', ')}. Add a {{#${poolListName(missing[0])}}} section.`);
  process.exit(1);
}

// The config file's name is the network's slug in the registry (and in the Goldsky subgraph name).
const slug = path.basename(configPath, '.json');
const poolLists = poolListsFor(loadRegistry(), slug);

// Mustache can't reach the top-level network and apiVersion from inside a list, so copy them in.
for (const [listName, pools] of Object.entries(poolLists)) {
  config[listName] = pools.map(pool => ({
    ...pool,
    network: config.network,
    apiVersion: config.apiVersion
  }));
}

// Render template
const output = mustache.render(template, config);

// Write output
fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
