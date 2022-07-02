# called from project root with: sh scripts/deploy.sh
near delete oracle.idea404.testnet idea404.testnet
near create-account oracle.idea404.testnet --masterAccount idea404.testnet --initialBalance 10
near deploy --accountId oracle.idea404.testnet --wasmFile contract/build/main.wasm --initFunction init --initArgs '{}'