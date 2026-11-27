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

### Factoring pools:

The factoring pool data sources come from the shared pool config in [`@bulla/registry`](https://www.npmjs.com/package/@bulla/registry) (factoring-contracts' `pools.json`), not from `config/*.json`. Each pool on the network gets a data source for its `version`, starting at its `deployBlock`. To add, redeploy or drop a pool, change it in factoring-contracts, then bump `@bulla/registry` in `bulla-contracts/package.json` and redeploy the subgraph.

### Deploying (dev automatically, prod by hand):

Each network has a `dev` and a `prod` Goldsky tag. Consumers read the tags, never a version. A deploy always creates a new version, because Goldsky never overwrites one, and a tag only moves to a version once it has synced. Arbitrum takes about a day to sync, so no workflow waits on a sync.

| Workflow | What it does |
|--|--|
| **Deploy** (`deploy.yml`) | Builds one network, deploys it under the next version and records the build in `builds.json` (`src/scripts/subgraph-deploy.js`). It moves no tag. A newer deploy deletes a version still waiting for `dev`, so only one re-indexes at a time. |
| **Promote Pending** (`promote-pending.yml`, hourly) | For each network whose newest recorded build `dev` doesn't have yet, it moves `dev` once Goldsky reports that build synced and healthy (`src/scripts/subgraph-promote-pending.js`). It checks the served hash, records the move in `deployments.json`, and deletes the version `dev` left, unless another tag still points to it. A build still syncing is checked again next hour; a failed one fails the run. |
| **Promote** (`promote.yml`, by hand) | Moves `prod` (or `dev`) to a recorded version that has synced (`src/scripts/subgraph-promote.js`), with the same checks. This is how prod moves. |
| **Registry Bump** (`registry-bump.yml`) | Started by bulla-registry after each `@bulla/registry` release. It bumps the package, tests, builds every network, commits the bump, and runs Deploy for the networks whose manifest changed (`src/scripts/changed-networks.js`). A new major fails: it needs a deliberate bump. |

`builds.json` and `deployments.json` (repo root) are committed by releasebot-bulla (`src/scripts/commit-records.sh`), never by hand (DEV-2773, DEV-2996).

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
