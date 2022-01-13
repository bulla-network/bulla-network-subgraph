# Bulla Network Subgraph
### A subgraph written for the Bulla Network smart contract ecosystem.
### [🔗 GitHub](https://github.com/bulla-network/bulla-network-subgraph)
### [🔗 Subgraph Playgroundyar](https://thegraph.com/hosted-service/subgraph/colinnielsen/first-subgraph)

## Setup:
### The Graph setup
1. `yarn global add @graphprotocol/graph-cli` - this installs the cli to interact with The Graph
2. `cd bulla-contracts`
5. `yarn`

### Available commands:
- `yarn codegen` - generates new assemblyscript mappings from the `schema.graphql` file
- `yarn build` - builds wasm modules from the config in `subgraph.yaml` and the mappings in `/mappings/*`
- `yarn deploy` - deploys subgraph to the subgraph specified in the package.json. Must be authenticated via the Graph CLI. See more [here](https://thegraph.com/docs/en/developer/quick-start/#4-deploy-to-the-subgraph-studio)
