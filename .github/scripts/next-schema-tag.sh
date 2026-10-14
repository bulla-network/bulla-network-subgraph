#!/usr/bin/env bash
# Prints the schema tag COMMIT should get, or nothing when no bump is due.
# Read-only: it never creates or pushes a tag, so it is safe to run locally.
#
#   .github/scripts/next-schema-tag.sh <commit> ["label label ..."]
#
# Labels are the merged PR's labels: `breaking` -> next major,
# `schema-bump` -> next minor even without a schema change.
set -euo pipefail

SCHEMA=bulla-contracts/schema.graphql
commit=${1:?usage: next-schema-tag.sh <commit> [label ...]}
shift
labels=" $* "

if [ -n "$(git tag --points-at "$commit" --list 'schema-v*')" ]; then
  echo "$commit already has a schema tag" >&2
  exit 0
fi

if ! last=$(git describe --tags --abbrev=0 --match 'schema-v*' "$commit" 2>/dev/null); then
  echo "no schema tag before $commit; create schema-v2.0.0 by hand" >&2
  exit 0
fi

if ! [[ $last =~ ^schema-v([0-9]+)\.([0-9]+)\.0$ ]]; then
  echo "unexpected tag format: $last" >&2
  exit 1
fi
major=${BASH_REMATCH[1]}
minor=${BASH_REMATCH[2]}

changed=false
git diff --quiet "$last" "$commit" -- "$SCHEMA" || changed=true

if [[ $labels == *" breaking "* ]]; then
  echo "schema-v$((major + 1)).0.0"
elif $changed || [[ $labels == *" schema-bump "* ]]; then
  echo "schema-v$major.$((minor + 1)).0"
else
  echo "no schema change since $last" >&2
fi
