#!/usr/bin/env node

// Checks that bulla_registry_export/address_config.json lists a Goldsky
// endpoint for every network in config/, and nothing else. The export is
// written by hand, so a new network config is easy to ship without it.

const fs = require("fs");
const path = require("path");

// The Graph's network name (the "network" field in config/*.json) -> chain ID.
const CHAIN_IDS = {
  mainnet: 1,
  optimism: 10,
  xdc: 50,
  bsc: 56,
  xdai: 100,
  matic: 137,
  redbelly: 151,
  base: 8453,
  "arbitrum-one": 42161,
  celo: 42220,
  avalanche: 43114,
  sepolia: 11155111,
};

const configDir = path.join(__dirname, "..", "..", "config");
const exportPath = path.join(__dirname, "..", "..", "..", "bulla_registry_export", "address_config.json");

const endpoints = JSON.parse(fs.readFileSync(exportPath, "utf8")).endpoints;
const errors = [];
const expectedChainIds = new Set();

for (const file of fs.readdirSync(configDir).filter((f) => f.endsWith(".json")).sort()) {
  // The config file's name is the Goldsky subgraph suffix (see deploy-goldsky.js).
  const slug = path.basename(file, ".json");
  const network = JSON.parse(fs.readFileSync(path.join(configDir, file), "utf8")).network;
  const chainId = CHAIN_IDS[network];

  if (chainId === undefined) {
    errors.push(`config/${file}: unknown network "${network}". Add its chain ID to CHAIN_IDS in ${path.basename(__filename)}.`);
    continue;
  }
  expectedChainIds.add(String(chainId));

  const url = endpoints[chainId];
  if (!url) {
    errors.push(`config/${file}: no endpoint for chain ${chainId} in bulla_registry_export/address_config.json.`);
  } else if (!url.includes(`/subgraphs/bulla-contracts-${slug}/`)) {
    errors.push(`config/${file}: the endpoint for chain ${chainId} doesn't point at bulla-contracts-${slug}: ${url}`);
  }
}

for (const chainId of Object.keys(endpoints)) {
  if (!expectedChainIds.has(chainId)) {
    errors.push(`bulla_registry_export/address_config.json: chain ${chainId} has an endpoint but no file in config/.`);
  }
}

if (errors.length > 0) {
  console.error("The registry export doesn't match config/:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Registry export matches config/ (${expectedChainIds.size} networks).`);
