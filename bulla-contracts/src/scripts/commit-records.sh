#!/usr/bin/env bash
# Commits the record files a Deploy or Promote run saved under $RECORDS_DIR to builds.json and
# deployments.json on main, as the GitHub App whose token is in $GH_TOKEN (releasebot-bulla).
# Another run may push first, so each attempt starts again from the new main and re-applies the
# records (records.js apply is idempotent).
#
#   APP_SLUG=releasebot-bulla GH_TOKEN=... RECORDS_DIR=... commit-records.sh "<commit message>"
set -euo pipefail

# Run from a copy: the git reset below rewrites this file when main changed it, and bash reads a script
# as it runs.
if [ -z "${COMMIT_RECORDS_COPY:-}" ]; then
  copy=$(mktemp)
  cp "$0" "$copy"
  COMMIT_RECORDS_COPY=1 exec bash "$copy" "$@"
fi

message="$1"
root=$(git rev-parse --show-toplevel)
cd "$root"

shopt -s nullglob
files=("$RECORDS_DIR"/*.json)
if [ ${#files[@]} -eq 0 ]; then
  echo "No records to commit"
  exit 0
fi

user_id=$(gh api "/users/${APP_SLUG}[bot]" --jq .id)
git config user.name "${APP_SLUG}[bot]"
git config user.email "${user_id}+${APP_SLUG}[bot]@users.noreply.github.com"

for attempt in 1 2 3 4 5; do
  git fetch origin main
  git reset --hard origin/main
  node bulla-contracts/src/scripts/records.js apply "${files[@]}"
  git add builds.json deployments.json
  if git diff --cached --quiet; then
    echo "Nothing new to record"
    exit 0
  fi
  git commit -m "$message"
  if git push origin HEAD:main; then
    exit 0
  fi
  sleep $((attempt * 10))
done

echo "::error::Couldn't push the records after 5 attempts"
exit 1
