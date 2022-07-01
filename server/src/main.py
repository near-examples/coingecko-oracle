import json
from base64 import b64encode
from datetime import datetime

import requests
from pycoingecko import CoinGeckoAPI
from structlog import get_logger


class CGFeeder:
    def __init__(self, destination_account_id: str):
        self.cg = CoinGeckoAPI()
        self.oracle_account_id = destination_account_id
        self.rpc_url = "https://rpc.testnet.near.org"
        self.logger = get_logger()
        self.logger.info("CGFeeder initialized")
        
    def get_data(self) -> dict[str, dict[str, float]]:
        symbol_name = "near"
        try:
            self.logger.info(f"Getting price for {symbol_name} from CG")
            result = self.cg.get_price(
                ids=f"{symbol_name}",
                vs_currencies="usd",
                include_last_updated_at="true",
            )
            timestamp = datetime.fromtimestamp(result[symbol_name]["last_updated_at"])
            return {"data": {timestamp.isoformat(): result[symbol_name]["usd"]}}
        except Exception as ex:
            self.logger.error(ex)
            return {}

    def send_data_to_contract(self, data: dict[str, dict[str, float]]):
        self.logger.info("Sending price to SC")
        self.logger.debug(f"{self.oracle_account_id} || {data}")
        b64_data = b64encode(json.dumps(data).encode("utf-8"))
        payload = json.dumps(
            {
                "jsonrpc": "2.0",
                "id": "dontcare",
                "method": "query",
                "params": {
                    "request_type": "call_function",
                    "finality": "final",
                    "account_id": self.oracle_account_id,
                    "method_name": "addPrices",
                    "args_base64": b64_data,
                },
            }
        )
        headers = {"Content-Type": "application/json"}
        res = requests.post(self.rpc_url, headers=headers, data=payload)
        self.logger.info(f"Price sent to SC. [Code: {res.status_code}]")
        self.logger.debug(f"{res.text}")

    def gather_and_send(self):
        near_price = self.get_data()
        self.send_data_to_contract(near_price)

    def close(self):
        self.cg.session.close()
        self.logger.info("CGFeeder closed")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--account_id", "-a", help="account_id of the oracle contract")
    args = parser.parse_args()
    feeder = CGFeeder(destination_account=args.account_id)
    feeder.gather_and_send()
    feeder.close()
