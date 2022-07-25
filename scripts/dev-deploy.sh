#!/bin/bash
# should be called like this: ./dev-deploy.sh <new-account-name> <master-account-name>

# check if account exists by calling RPC
echo "Checking RPC for account $1..."
curl_out=$(curl --location --request POST 'https://rpc.testnet.near.org/' \
    --header 'Content-Type: application/json' \
    --data-raw '{
  "jsonrpc": "2.0",
  "id": "dontcare",
  "method": "query",
  "params": {
    "request_type": "view_account",
    "finality": "final",
    "account_id": "'"$1"'"
  }
}')
curl_arr=($curl_out)
msg=${curl_arr[1]}
# "error","data":"account" only shows when account is not found, so we delete it if it exists
if ! [[ $msg == 'error","data":"account' ]]; then
    echo "account exists, deleting... command: near delete $1 $2"
    near delete $1 $2
fi
near create-account $1 --masterAccount $2 --initialBalance 10
near deploy --accountId $1 --wasmFile contract/build/contract.wasm --initFunction init --initArgs '{}'