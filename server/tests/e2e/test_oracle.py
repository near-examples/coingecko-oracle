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
        self.cg = CGFeeder(self.oracle_account_id, self.feeder_account_id)
        self.url = "https://rpc.testnet.near.org"

    def tearDown(self) -> None:
        self.cg.close()

    def test_oracle(self):
        prev_data = self.cg.get_data_from_contract()
        self.cg.gather_and_send()
        time.sleep(10)
        data = self.cg.get_data_from_contract()
        self.assertTrue(len(data) == len(prev_data) + 1, "Data not updated")
        i = 0
        for key, value in data.items():
            i += 1
            self.assertTrue(isinstance(key, str))
            self.assertTrue(isinstance(value, float))

            if i == len(data):
                dt = datetime.fromisoformat(key)
                self.assertTrue(dt.year, datetime.now().year)
                self.assertTrue(dt.month, datetime.now().month)
                self.assertTrue(dt.day, datetime.now().day)
