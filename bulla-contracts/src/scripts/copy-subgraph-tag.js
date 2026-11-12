#!/usr/bin/env node

// Adds tags to whatever version an existing tag points to.
//
//   SOURCE_TAG=dev-complete-rework TAGS=dev,prod NETWORKS=sepolia,base node src/scripts/copy-subgraph-tag.js
//
// NETWORKS defaults to every network that has a deploy script. DRY_RUN=1 prints what it would do.
// The version behind SOURCE_TAG is found by matching the deployment ID that the tag's public
// endpoint serves against the deployment ID of each version listed by `goldsky subgraph list`,
// so it does not depend on the CLI's table layout.

const { execSync } = require("child_process");

const PROJECT = process.env.GOLDSKY_PROJECT || "project_clxvwihx9eci401ud1suddgpf";
const ALL_NETWORKS = [
  "mainnet", "arbitrum", "gnosis", "polygon", "optimism", "avalanche",
  "celo", "sepolia", "base", "bnb_chain", "redbelly", "xdc",
];

const sourceTag = process.env.SOURCE_TAG;
const tags = (process.env.TAGS || "").split(",").map((t) => t.trim()).filter(Boolean);
const networks = (process.env.NETWORKS || "").split(",").map((n) => n.trim()).filter(Boolean);
const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

if (!sourceTag) {
  console.error("Error: SOURCE_TAG is not set (e.g. 'dev-complete-rework')");
  process.exit(1);
}
if (tags.length === 0) {
  console.error("Error: TAGS is not set (comma-separated, e.g. 'dev,prod')");
  process.exit(1);
}

const endpoint = (name, ref) => `https://api.goldsky.com/api/public/${PROJECT}/subgraphs/${name}/${ref}/gn`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The public endpoint rate-limits per IP in 10-second windows; wait out the window and retry.
async function deploymentOf(name, ref) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(endpoint(name, ref), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "{ _meta { deployment } }" }),
    });
    const text = await res.text();
    if (res.status === 429 || text.includes("query allowance")) {
      await sleep(11000);
      continue;
    }
    if (!res.ok) return null;
    try {
      return JSON.parse(text)?.data?._meta?.deployment ?? null;
    } catch {
      return null;
    }
  }
  throw new Error(`${name}/${ref}: still rate-limited after retries`);
}

function listVersions(name) {
  const out = execSync(`goldsky subgraph list ${name}`).toString();
  if (out.includes("No subgraphs found")) return [];
  return [...new Set(out.match(/\b\d+\.\d+\.\d+\b/g) || [])];
}

async function versionForTag(name, tag) {
  const target = await deploymentOf(name, tag);
  if (!target) throw new Error(`${name}/${tag} does not resolve (tag missing or subgraph down)`);
  const matches = [];
  for (const version of listVersions(name)) {
    if ((await deploymentOf(name, version)) === target) matches.push(version);
  }
  if (matches.length === 0) throw new Error(`no listed version of ${name} serves ${target} (${tag})`);
  // Several versions can share a deployment ID (same build redeployed); the tag only points to one,
  // but any of them serves the same data. Take the highest.
  return { version: matches.sort(compareSemver).pop(), deployment: target };
}

function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

async function main() {
  const targets = networks.length ? networks : ALL_NETWORKS;
  const failures = [];
  for (const network of targets) {
    const name = `bulla-contracts-${network}`;
    try {
      const { version, deployment } = await versionForTag(name, sourceTag);
      console.log(`${name}: '${sourceTag}' -> ${version} (${deployment})`);
      for (const tag of tags) {
        if ((await deploymentOf(name, tag)) === deployment) {
          console.log(`  '${tag}' already serves ${deployment}, skipping`);
          continue;
        }
        const cmd = `goldsky subgraph tag create ${name}/${version} --tag ${tag}`;
        console.log(`  ${dryRun ? "[dry run] " : ""}${cmd}`);
        if (!dryRun) execSync(cmd, { stdio: "inherit" });
      }
      if (!dryRun) {
        for (const tag of tags) {
          // A new tag can take a few seconds to reach the public endpoint.
          let got = null;
          for (let attempt = 0; attempt < 12 && got !== deployment; attempt++) {
            if (attempt) await sleep(5000);
            got = await deploymentOf(name, tag);
          }
          if (got !== deployment) throw new Error(`'${tag}' serves ${got} after tagging, expected ${deployment}`);
        }
        console.log(`  verified: ${tags.join(", ")} serve ${deployment}`);
      }
    } catch (error) {
      console.error(`${name}: ${error.message}`);
      failures.push(network);
    }
  }
  if (failures.length) {
    console.error(`Failed: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main();
