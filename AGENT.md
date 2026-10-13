# Agent guidance (bulla-network-subgraph)

## Label PRs that change the schema's meaning

Merging to `main` tags the next schema version (`schema-vMAJOR.MINOR.0`); consumers pin these tags. CI reads the PR's labels at merge, so set them before the PR merges. See `docs/versioning.md`.

| The PR… | Label |
| -- | -- |
| removes or renames a type, field or enum value, or changes a field's type | `breaking` |
| changes a mapping so an existing field means something different (units, what gets counted, when it's set), without touching `schema.graphql` | `schema-bump` |
| only adds to `schema.graphql`, or doesn't change what any field means | none |

-   The **Schema Check** fails a PR with breaking schema changes until it has `breaking`. Don't make it pass any other way.
-   `schema-bump` has no check: decide it yourself whenever a mapping changes, and say why in the PR description.
-   Add a label with `gh pr edit <number> --add-label breaking`. Update the labels whenever later commits change the answer.
