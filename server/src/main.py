import subprocess
from datetime import datetime
from pathlib import Path

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

    def get_data(self) -> str:
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
            return '{"' + f"{timestamp.isoformat()}" + '":' + f'{result[symbol_name]["usd"]}' + '}'
        except Exception as ex:
            self.logger.error(ex)
            return {}

    def send_data_to_contract(self, data: str):
        self.logger.info("Sending price to Oracle")
        self.logger.debug(f"{self.oracle_account_id} || {data}")
        str_data = "'" + '{"data":' + data + "}" + "'"
        self.logger.debug(f"str_data: {str_data}")
        try:
            keys_path = Path.home() / ".near-credentials" / "testnet" / (self.account_id + ".json")
            subprocess.run([
                "near", "call", self.oracle_account_id, "addPrices", 
                "--accountId", self.account_id, "--keyPath", keys_path.as_posix(), "--args", str_data, "-v"
            ], shell=True, check=True, capture_output=True)
            self.logger.debug("Price sent to Oracle")
        except Exception as ex:
            self.logger.exception(f"Failed to send price to Oracle: {ex}")

    def gather_and_send(self):
        near_price = self.get_data()
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
