import subprocess

TEST_ORACLE_ACCOUNT_NAME = "test.coingecko-feed.idea404.testnet"

def deploy_contract(account_name: str) -> str:
    res = subprocess.call(['sh', './scripts/dev-deploy.sh', account_name]) 
    if res != 0:
        raise Exception("dev-deploy.sh failed")
    return account_name

def delete_account(account_name: str) -> None:
    res = subprocess.call(['sh', './scripts/dev-delete.sh', account_name])
    if res != 0:
        raise Exception("dev-delete.sh failed") 
