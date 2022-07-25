# this script extracts the public and private keys from the environment 
# and saves them to a JSON file in /.near-credentials/testnet/coingecko-feed.idea404.testnet.json
cd 
mkdir -p .near-credentials/testnet
cd .near-credentials/testnet
JSON_STRING=$( jq -n \
                  --arg pbk "$PB_KEY" \
                  --arg prk "$PR_KEY" \
                  '{"account_id": "coingecko-feed.idea404.testnet", "public_key": $pbk, "private_key": $prk}' )
echo $JSON_STRING > coingecko-feed.idea404.testnet.json
# add empty keys for test.coingecko-feed.idea404.testnet.json
JSON_STRING=$( jq -n \
                  --arg pbk "" \
                  --arg prk "" \
                  '{"account_id": "test.coingecko-feed.idea404.testnet", "public_key": "ed25519:3THErKbiH7Ai68E3w5xcfUTySGDXPFyPMyezXjTP1R6j", "private_key": "ed25519:4tSMz1ksumt1sRdEikBP48DytyFqjVBf9jDxpEN1kpJcZ8YGKpyJUReZxcmJTojZvvY6MAAPWYzfAifrJ6GkVrsi"}' )
echo $JSON_STRING > test.coingecko-feed.idea404.testnet.json