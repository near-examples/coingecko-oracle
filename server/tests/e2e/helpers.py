import subprocess

def deploy_contract(account_name: str) -> str:
    res = subprocess.call(['sh', './scripts/dev-deploy.sh', account_name]) 
    if res != 0:
        raise Exception("dev-deploy.sh failed")
    return account_name

def delete_account():
    pass 
