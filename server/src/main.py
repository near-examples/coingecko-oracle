import json
import os
from datetime import datetime
from typing import Dict, List

import requests
from pycoingecko import CoinGeckoAPI
from structlog import get_logger


class CGFeeder:
    def __init__(self, destination_account_id: str, feed_account_id: str):
        self.account_id = feed_account_id
        self.oracle_account_id = destination_account_id
        self.cg = CoinGeckoAPI()
        self.rpc_url = "https://rpc.testnet.near.org"
        self.logger = get_logger()
        self.logger.info("CGFeeder initialized")

    def get_coingecko_data(self) -> Dict[str, float]:
        symbol_name = "near"
        try:
            self.logger.info(f"Getting price for {symbol_name} from CG")
            result = self.cg.get_price(
                ids=f"{symbol_name}",
                vs_currencies="usd",
                include_last_updated_at="true",
            )
            timestamp = datetime.fromtimestamp(
                result[symbol_name]["last_updated_at"]
            )
            return {timestamp.isoformat(): result[symbol_name]["usd"]}
        except Exception as ex:
            self.logger.error(ex)
            return {}

    def send_data_to_contract(self, data: str):
        self.logger.info("Sending price to Oracle")
        self.logger.debug(f"{self.oracle_account_id} || {data}")
        data_dict = {"data": data}
        self.logger.debug(f"data_dict: {data_dict}")
        str_data = json.dumps(data_dict)
        self.logger.debug(f"str_data: {str_data}")
        commands_list = [
            "near", "call", self.oracle_account_id, "addPrices",
            "--accountId", self.account_id,
            "--args", "'" + str_data + "'"
        ]
        command = " ".join(commands_list)
        self.logger.debug(f"command: {command}")
        res = os.system(command)
        if res != 0:
            self.logger.error(f"Error sending data to Oracle")
            return
        self.logger.info("Price sent to Oracle")

    def get_data_from_contract(self) -> List[Dict[str, float]]:
        self.logger.info("Getting data from Oracle")
        url = "https://rpc.testnet.near.org/"
        payload = json.dumps({
            "jsonrpc": "2.0",
            "id": "dontcare",
            "method": "query",
            "params": {
                "request_type": "call_function",
                "finality": "final",
                "account_id": self.oracle_account_id,
                "method_name": "getPrices",
                "args_base64": ""
            }
        })
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        self.logger.debug(f"response: {response}")
        self.logger.debug(f"response.json(): {response.json()}")
        assert "result" in response.json() and "result" in response.json()["result"], \
            "Response does not contain result"
        bytes_array = response.json()["result"]["result"]
        data_str = bytearray(bytes_array).decode("utf-8")
        data = json.loads(data_str)
        self.logger.debug(f"data: {data}")
        return data

    def gather_and_send(self):
        near_price = self.get_coingecko_data()
        self.send_data_to_contract(near_price)

    def close(self):
        self.cg.session.close()
        self.logger.info("CGFeeder closed")


if __name__ == "__main__":
    import argparse

    from server.src.utils import FEED_ACCOUNT_ID
    parser = argparse.ArgumentParser()
    parser.add_argument("--account_id", "-a", "-o",
                        help="account_id of the oracle contract")
    args = parser.parse_args()
    feeder = CGFeeder(destination_account_id=args.account_id,
                      feed_account_id=FEED_ACCOUNT_ID)
    feeder.gather_and_send()
    feeder.close()
