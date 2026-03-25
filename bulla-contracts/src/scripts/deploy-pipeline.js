#!/usr/bin/env node

const { execSync } = require("child_process");

const network = process.env.NETWORK;

if (!network) {
  console.error("Error: NETWORK environment variable is not set");
  process.exit(1);
}

if (!process.env.INVOICE_APPROVED_WEBHOOK_URL) {
  console.error("Error: INVOICE_APPROVED_WEBHOOK_URL environment variable is not set");
  process.exit(1);
}

const configPath = `pipelines/invoice-approved-${network}.yaml`;

try {
  console.log(`Deploying invoice-approved pipeline for network: ${network}`);
  execSync(`goldsky pipeline apply ${configPath}`, { stdio: "inherit" });
  console.log(`Successfully deployed invoice-approved-${network} pipeline`);
} catch (error) {
  console.error(`Error during pipeline deployment: ${error}`);
  process.exit(1);
}
