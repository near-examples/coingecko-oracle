import json
import subprocess
import time
import unittest
from datetime import datetime

from server.src.main import CGFeeder
from server.src.utils import (FEED_ACCOUNT_ID, TEST_ORACLE_ACCOUNT_ID,
                              delete_account, deploy_contract)


class TestOracle(unittest.TestCase):
    def setUp(self) -> None:
        self.oracle_account_id = TEST_ORACLE_ACCOUNT_ID
        self.feeder_account_id = FEED_ACCOUNT_ID
        self.oracle_account_id = deploy_contract(self.oracle_account_id, self.feeder_account_id)
        self.cg = CGFeeder(self.oracle_account_id, self.feeder_account_id)
        self.url = "https://rpc.testnet.near.org"

    def tearDown(self) -> None:
        self.cg.close()
        delete_account(self.oracle_account_id, self.cg.account_id)

    def test_oracle(self):
        self.cg.gather_and_send()
        time.sleep(5)
        data = self.cg.get_data_from_contract()
        self.assertTrue(len(data) > 0)
        for key, value in data.items():
            self.assertTrue(isinstance(key, str))
            self.assertTrue(isinstance(value, float))

            dt = datetime.fromisoformat(key)
            self.assertTrue(dt.year, datetime.now().year)
            self.assertTrue(dt.month, datetime.now().month)
            self.assertTrue(dt.day, datetime.now().day)
