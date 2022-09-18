import os

FEED_ACCOUNT_ID = "coingecko-feed.idea404.testnet"
TEST_ORACLE_ACCOUNT_ID = "test-oracle.idea404.testnet"


def deploy_contract(account_id: str, master_account_id: str) -> str:
    commands_list = [
        'sh', './scripts/dev-deploy.sh', account_id, master_account_id
    ]
    command = ' '.join(commands_list)
    res = os.system(command)
    if res != 0:
        raise Exception(f"Error deploying contract to {account_id}")
    return account_id


def delete_account(account_id: str, master_account_id: str) -> None:
    commands_list = [
        'sh', './scripts/dev-delete.sh', account_id, master_account_id
    ]
    command = ' '.join(commands_list)
    res = os.system(command)
    if res != 0:
        raise Exception(f"Error deleting account: {account_id}")
