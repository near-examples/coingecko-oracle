import subprocess

FEED_ACCOUNT_ID = "coingecko-feed.idea404.testnet"
TEST_ORACLE_ACCOUNT_ID = "test.coingecko-feed.idea404.testnet"


def deploy_contract(account_id: str, master_account_id: str) -> str:
    subprocess.run(['sh', './scripts/dev-deploy.sh', account_id, master_account_id], shell=True, check=True)
    return account_id


def delete_account(account_id: str, master_account_id: str) -> None:
    subprocess.run(['sh', './scripts/dev-delete.sh', account_id, master_account_id], shell=True, check=True)
