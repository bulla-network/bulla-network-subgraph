# Subgraph versioning

Two kinds of version, kept apart (DEV-2773):

- **Schema version**: what consumers (bulla-banker, bulla-cli) pin. A git tag `schema-vMAJOR.MINOR.0` in this repo.
- **Subgraph version**: the name of one Goldsky build on one network (`bulla-contracts-polygon/1.14.0`). Many subgraph versions can share a schema version, e.g. a redeploy with a new start block.

## Schema versions

The schema version lives only in git tags `schema-vMAJOR.MINOR.0`. There is no version file and no patch number.

CI creates the tags (`.github/workflows/schema-tag.yml`). On every merge to `main` it finds the merged PR and:

| Merged PR | Tag |
| -- | -- |
| labelled `breaking` | next major (`schema-v2.0.0`) |
| changes `bulla-contracts/schema.graphql` since the last schema tag | next minor (`schema-v1.4.0`) |
| labelled `schema-bump`, no schema change | next minor. Use it when a mapping change alters what a field means. |
| anything else | no tag |

Direct pushes to `main` (no PR) are never tagged; their schema changes are picked up by the next merged PR, because the comparison is always against the last schema tag.

`.github/workflows/schema-check.yml` diffs each PR's schema against the last schema tag with graphql-inspector and fails on breaking changes (removed field, changed type, removed enum value…) unless the PR is labelled `breaking`.

To see what a commit would be tagged, run `.github/scripts/next-schema-tag.sh <commit> "<labels>"`. It only prints the tag.

The starting tag `schema-v1.0.0` is created by hand on `main` after this lands. Until it exists, both workflows skip.

**Consumers** accept a build when its schema has the same major and an equal or higher minor than the one they require.

## Rules for the Deploy workflow (later PR)

- Deploy only from `main`.
- A build's schema version is `git describe --tags --abbrev=0 --match 'schema-v*'` at the commit it was built from.
- Keep the Goldsky version auto-increment in `bulla-contracts/src/scripts/deploy-goldsky.js` instead of a manual `subgraph_version` input.

## Goldsky tags

New `dev` and `prod` tags go alongside today's tags and replace them once consumers have switched:

- `dev-complete-rework`: used by the frontend.
- `v2-main` and `latest`: used by the backend (set by `tag-subgraph-latest.js`).

On Sepolia today the frontend and backend tags serve different builds, so the first records must come from what each tag serves, not from assumptions.
