#!/usr/bin/env node
/**
 * Preprocesses the config file to inject top-level values into array entries.
 * This is needed because Mustache doesn't support accessing parent context from within array iterations.
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

// Inject top-level values into pool entries for all pool lists
const poolLists = ['bullaFactoringV0Pools', 'bullaFactoringV1Pools', 'bullaFactoringV2_1Pools', 'bullaFactoringV2_2Pools'];

poolLists.forEach(listName => {
  if (config[listName] && Array.isArray(config[listName])) {
    config[listName] = config[listName].map(pool => ({
      ...pool,
      network: config.network,
      apiVersion: config.apiVersion
    }));
  }
});

// Render template
const output = mustache.render(template, config);

// Write output
fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
