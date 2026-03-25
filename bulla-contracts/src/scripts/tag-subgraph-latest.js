#!/usr/bin/env node

const { execSync } = require("child_process");

const network = process.env.NETWORK;

if (!network) {
  console.error("Error: NETWORK environment variable is not set");
  process.exit(1);
}

const subgraphName = `bulla-contracts-${network}`;
const tags = ["v2-main", "latest"];

try {
  console.log(`Finding highest version for ${subgraphName}...`);

  const cmdOutput = execSync(`goldsky subgraph list ${subgraphName}`);
  const listResult = cmdOutput.toString();

  if (listResult.includes("No subgraphs found")) {
    console.error(`No subgraphs found for ${subgraphName}`);
    process.exit(1);
  }

  const versionRegex = /(\d+\.\d+\.\d+)/g;
  const versionMatches = listResult.match(versionRegex);

  if (!versionMatches || versionMatches.length === 0) {
    console.error("Could not find any versions from goldsky output");
    process.exit(1);
  }

  const highestVersion = versionMatches.reduce((highest, current) => {
    const parseVersion = (version) => {
      const parts = version.split(".").map((num) => parseInt(num, 10));
      return parts[0] * 10000 + parts[1] * 100 + parts[2];
    };
    return parseVersion(current) > parseVersion(highest) ? current : highest;
  }, "0.0.0");

  console.log(`Highest version: ${highestVersion}`);

  for (const tag of tags) {
    console.log(`Setting tag '${tag}' on ${subgraphName}/${highestVersion}...`);
    execSync(`goldsky subgraph tag create ${subgraphName}/${highestVersion} --tag ${tag}`, { stdio: "inherit" });
    console.log(`Successfully tagged ${subgraphName}/${highestVersion} as '${tag}'`);
  }
} catch (error) {
  console.error(`Error during tagging: ${error}`);
  process.exit(1);
}
