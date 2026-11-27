#!/usr/bin/env node
/**
 * Renders template.yaml for one network: its contracts from the config file, and its factoring pools
 * from @bulla/registry (see manifest.js).
 */

const fs = require('fs');
const path = require('path');
const { renderManifest } = require('./manifest');

const configPath = process.argv[2];
const templatePath = process.argv[3];
const outputPath = process.argv[4];

if (!configPath || !templatePath || !outputPath) {
  console.error('Usage: node prep-config.js <config.json> <template.yaml> <output.yaml>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

// The config file's name is the network's slug in the registry (and in the Goldsky subgraph name).
const slug = path.basename(configPath, '.json');

let output;
try {
  output = renderManifest({ config, template, slug });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

fs.writeFileSync(outputPath, output);
console.log(`Generated ${outputPath}`);
