# Bulla Network Subgraph

### A subgraph written for the Bulla Network smart contract ecosystem.

### [🔗 GitHub](https://github.com/bulla-network/bulla-network-subgraph)

### GQL Playgrounds:

- [🔗 Mainnet Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-mainnet)
- [🔗 Polygon Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-polygon)
- [🔗 Gnosis Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-gnosis)
- [🔗 Harmony Subgraph Playground](https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-harmony)
- [🔗 Celo Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-celo)
- [🔗 Avalanche Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-avalanche)
- [🔗 Goerli Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-goerli)
- [🔗 Base Subgraph Playground](https://api.studio.thegraph.com/query/13828/bulla-contracts-base/v1)
- [🔗 Base Testnet Subgraph Playground](https://api.studio.thegraph.com/query/13828/bulla-contracts-base-testnet/v1)
- [🔗 Rinkeby Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-rinkby)
- [🔗 Aurora Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-aurora)
- [🔗 Moonbeam Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-moonbeam)
- [🔗 Arbitrum Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-arbitrum)
- [🔗 BNB Chain Subgraph Playground](https://thegraph.com/hosted-service/subgraph/bulla-network/bulla-contracts-bnb-chain)
- [🔗 Sepolia Subgraph Playground](https://thegraph.com/studio/subgraph/bulla-contracts-sepolia/playground)

### Available commands:

- `yarn test` - runs matchstick tests against mapping files
- `yarn build` - builds wasm modules from the config in `subgraph.yaml` and the mappings in `/mappings/*`
- `yarn deploy:NETWORK` - deploys subgraph to the subgraph specified in the package.json. Must be authenticated via the Graph CLI. See more [here](https://thegraph.com/docs/en/developer/quick-start/#4-deploy-to-the-subgraph-studio)

### Endpoint URLs:

- Mainnet: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-mainnet`
- Polygon: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-polygon`
- Harmony: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-harmony`
- Celo: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-celo`
- Avalanche: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-avalanche`
- Goerli: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-goerli`
- Base: `https://api.studio.thegraph.com/query/13828/bulla-contracts-base/v1`
- Base-Testnet: `https://api.studio.thegraph.com/query/13828/bulla-contracts-base-testnet/v1`
- Rinkeby: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-rinkby`
- Aurora: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-aurora`
- Moonbeam: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-moonbeam`
- Arbitrum: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-arbitrum`
- BNB Chain: `https://api.thegraph.com/subgraphs/name/bulla-network/bulla-contracts-bnb-chain`
- Sepolia: `https://api.studio.thegraph.com/query/70345/bulla-contracts-sepolia/0.4.1`

### Goldsky CLI Setup

#### Installation

To install the Goldsky CLI, you need to have Node.js (v16 or later) and yarn installed. Then run:

```bash
yarn global add @goldsky/cli
```

#### Authentication

After installation, you need to authenticate with Goldsky:

```bash
goldsky auth login
```

Follow the prompts to complete the authentication process. This will open a browser window where you can log in with your Goldsky account.

#### Creating a Goldsky Deployment

To deploy a subgraph to Goldsky, you need to:

1. Build your subgraph:

   ```bash
   yarn build:network
   ```

2. To deploy, use or add an entry in package.json

   ```bash
   yarn deploy:network
   ```
