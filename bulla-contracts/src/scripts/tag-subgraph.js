#!/usr/bin/env node

const { execSync } = require("child_process");

const network = process.env.NETWORK;
const version = process.env.VERSION;
const tags = process.env.TAGS;

if (!network) {
  console.error("Error: NETWORK environment variable is not set");
  process.exit(1);
}

if (!version) {
  console.error("Error: VERSION environment variable is not set");
  process.exit(1);
}

if (!tags) {
  console.error("Error: TAGS environment variable is not set (comma-separated, e.g. 'v2-main,latest')");
  process.exit(1);
}

const subgraphName = `bulla-contracts-${network}`;
const tagList = tags.split(",").map((t) => t.trim());

try {
  for (const tag of tagList) {
    console.log(`Setting tag '${tag}' on ${subgraphName}/${version}...`);
    execSync(`goldsky subgraph tag create ${subgraphName}/${version} --tag ${tag}`, { stdio: "inherit" });
    console.log(`Successfully tagged ${subgraphName}/${version} as '${tag}'`);
  }
} catch (error) {
  console.error(`Error during tagging: ${error}`);
  process.exit(1);
}
