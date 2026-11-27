#!/usr/bin/env node
// The subgraph's deploy records (DEV-2773), committed at the repo root:
//
//   builds.json       network -> subgraph version -> { schema, deployment, commit, deployedAt }
//   deployments.json  network -> tag (dev, prod)  -> { subgraphVersion, movedAt }
//
// The Deploy and Promote scripts write each change as a record file too. When pushing it to main loses
// a race, the workflow resets to the new main and re-applies the record files:
//
//   node src/scripts/records.js apply <record.json>...

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..", "..");
const BUILDS = path.join(ROOT, "builds.json");
const DEPLOYMENTS = path.join(ROOT, "deployments.json");

const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {});

// Keys sorted, so a record lands in the same place whichever run writes it
function sorted(value) {
  if (Array.isArray(value) || value === null || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sorted(value[k])]));
}
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(sorted(value), null, 2) + "\n");

// A build: refuses a version recorded with another deployment hash (Goldsky never overwrites a version,
// so that would mean the records are wrong). Re-recording the same build is a no-op.
function addBuild(builds, { network, version, schema, deployment, commit, deployedAt }) {
  const existing = builds[network] && builds[network][version];
  if (existing && existing.deployment !== deployment) {
    throw new Error(`builds.json has ${network} ${version} with deployment ${existing.deployment}, not ${deployment}`);
  }
  if (existing) return builds;
  return { ...builds, [network]: { ...builds[network], [version]: { schema, deployment, commit, deployedAt } } };
}

function setTag(deployments, { network, tag, version, movedAt }) {
  const current = deployments[network] && deployments[network][tag];
  if (current && current.subgraphVersion === version) return deployments;
  return { ...deployments, [network]: { ...deployments[network], [tag]: { subgraphVersion: version, movedAt } } };
}

function applyRecord(record) {
  if (record.type === "build") writeJson(BUILDS, addBuild(readJson(BUILDS), record));
  else if (record.type === "tag") writeJson(DEPLOYMENTS, setTag(readJson(DEPLOYMENTS), record));
  else throw new Error(`unknown record type ${record.type}`);
}

// Applies a record to the working tree and saves it under RECORDS_DIR (if set) for re-applying
function record(record) {
  applyRecord(record);
  const dir = process.env.RECORDS_DIR;
  if (dir) {
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}-${record.type}-${record.network}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2) + "\n");
  }
}

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

// The schema version of the current commit: its latest schema-vX.Y.Z tag
function schemaVersion() {
  return git("describe", "--tags", "--match", "schema-v*", "--abbrev=0").replace(/^schema-v/, "");
}

const currentCommit = () => git("rev-parse", "HEAD");

if (require.main === module) {
  const [command, ...files] = process.argv.slice(2);
  if (command !== "apply" || files.length === 0) {
    console.error("Usage: node records.js apply <record.json>...");
    process.exit(1);
  }
  try {
    for (const file of files.sort()) applyRecord(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { BUILDS, DEPLOYMENTS, readJson, addBuild, setTag, applyRecord, record, schemaVersion, currentCommit };
