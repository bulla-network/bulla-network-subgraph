# Bulla Network Subgraph

### A subgraph written for the Bulla Network smart contract ecosystem.

### [🔗 GitHub](https://github.com/bulla-network/bulla-network-subgraph)

### GQL Playgrounds:

- [🔗 Mainnet Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-mainnet)
- [🔗 Polygon Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-polygon)
- [🔗 Gnosis Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-gnosis)
- [🔗 Celo Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-celo)
- [🔗 Avalanche Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-avalanche)
- [🔗 Rinkeby Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-rinkby)
- [🔗 Aurora Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-aurora)
- [🔗 Moonbeam Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-moonbeam)
- [🔗 Arbitrum Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-arbitrum)

### Available commands:

- `yarn test` - runs matchstick tests against mapping files
- `yarn build` - builds wasm modules from the config in `subgraph.yaml` and the mappings in `/mappings/*`
- `yarn deploy:NETWORK` - deploys subgraph to the subgraph specified in the package.json. Must be authenticated via the Graph CLI. See more [here](https://thegraph.com/docs/en/developer/quick-start/#4-deploy-to-the-subgraph-studio)

### Endpoint URLs:

- Mainnet: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-mainnet`
- Polygon: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-polygon`
- Harmony: `https://graph.t.hmny.io/subgraphs/name/bulla-network/bulla-contracts/` (NOTE: due to harmony's 0.0.4 subgraphs requiring a different `graph-cli` version, harmony deploy scripts and configs are located on the `harmony` branch)
- Celo: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-celo`
- Avalanche: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-avalanche`
- Rinkeby: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-rinkby`
- Aurora: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-aurora`
- Moonbeam: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-moonbeam`
- Arbitrum: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-arbitrum`
