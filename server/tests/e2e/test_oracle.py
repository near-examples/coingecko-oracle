import unittest
from server.src.main import CGFeeder

from server.tests.e2e.helpers import delete_account, deploy_contract


class TestOracle(unittest.TestCase):
    def setUp(self) -> None:
        self.oracle_account_id = deploy_contract("test.coingecko-feed.idea404.testnet")
        self.cg = CGFeeder(destination_account_id=self.oracle_account_id)
        self.url = "https://rpc.testnet.near.org"

    def tearDown(self) -> None:
        delete_account(self.oracle_account_id)
        self.cg.close()

    def test_oracle(self):
        # then run the feeder once
        self.cg.gather_and_send()
        # then use requests to call the oracle contract fetching data
        res = requests.get()
        # then assert data is correct
        return True
