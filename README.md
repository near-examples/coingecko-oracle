# Simple Coingecko Oracle
This repo contains a simple Coingecko oracle that can be used to query the price of a cryptocurrency from within the network, in this case NEAR. The goal behind this example is to show how oracles can obtain their data from the outside world, and how they can be used to provide data to the network. 

The project is divided into two parts:
  - The first part is the oracle, which is a smart contract that can be queried from within the network for information and is deployed to `testnet`.
  - The second part is the server, which holds the keys to the only account that can push data to the oracle.

The folder structure matches this pattern too:

```
├── .github                         ⟵ contains GitHub Actions yml files for testing and running the code that pushes data to the testnet oracle
├── contract
   └── src                          ⟵ oracle contract code
   └── tests                        ⟵ integration tests for the oracle
├── scripts                         ⟵ contains helper scripts, e.g. deploying contract in GitHub CI  
├── server
   └── src                          ⟵ server code that pushes data to the oracle
   └── tests                        
        └── e2e                     ⟵ end-to-end tests for the server and contract
        └── integration/api         ⟵ integration tests for the server and source data
```