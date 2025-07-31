#!/usr/bin/env node

const { execSync } = require("child_process");

// Get the network from environment variable
const network = process.env.NETWORK;

if (!network) {
  console.error("Error: network environment variable is not set");
  process.exit(1);
}

try {
  console.log(`Deploying for network: ${network}`);

  // Fetch the latest version of the subgraph
  const cmdOutput = execSync(`goldsky subgraph list bulla-contracts-${network}`);
  const listResult = cmdOutput.toString();

  // Parse the output to get the highest version
  // This depends on the exact format of goldsky CLI output, might need adjustment
  const versionRegex = /(\d+\.\d+\.\d+)/g;
  const versionMatches = listResult.match(versionRegex);

  let currentVersion = null;
  console.log(`Goldsky versions: ${listResult}`);
  if (listResult.includes("No subgraphs found")) {
    currentVersion = "0.0.0";
  } else if (!versionMatches || versionMatches.length === 0) {
    console.error("Could not find current version from goldsky output");
    process.exit(1);
  } else {
    // Find the highest version
    currentVersion = versionMatches.reduce((highest, current) => {
      const parseVersion = (version) => {
        const parts = version.split(".").map((num) => parseInt(num, 10));
        return parts[0] * 10000 + parts[1] * 100 + parts[2];
      };

      return parseVersion(current) > parseVersion(highest) ? current : highest;
    }, "0.0.0");
  }

  console.log(`Current version: ${currentVersion}`);

  // Parse the version and increment the patch number
  const versionParts = currentVersion.split(".");
  const major = parseInt(versionParts[0], 10);
  const minor = parseInt(versionParts[1], 10);
  const patch = parseInt(versionParts[2], 10) + 1;
  const newVersion = `${major}.${minor}.${patch}`;

  console.log(`New version: ${newVersion}`);

  // Deploy the new version
  console.log(`Deploying bulla-contracts-${network}/${newVersion}...`);
  execSync(`goldsky subgraph deploy bulla-contracts-${network}/${newVersion}`, { stdio: "inherit" });

  console.log(`Successfully deployed bulla-contracts-${network}/${newVersion}`);
} catch (error) {
  console.error(`Error during deployment: ${error}`);
  process.exit(1);
}
