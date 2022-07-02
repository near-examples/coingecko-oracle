# should be called like this: ./dev-deploy.sh <new-account-name> <master-account-name>
near create-account $1 --masterAccount $2 --initialBalance 10
near deploy --accountId $1 --wasmFile contract/build/main.wasm --initFunction init --initArgs '{}'