import unittest

import requests
from server.src.main import CGFeeder
from server.tests.utils import (
    TEST_ORACLE_ACCOUNT_NAME, 
    delete_account,
    deploy_contract
)


class TestOracle(unittest.TestCase):
    def setUp(self) -> None:
        self.oracle_account_id = deploy_contract(TEST_ORACLE_ACCOUNT_NAME)
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
