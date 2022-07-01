import json
import unittest
from datetime import datetime

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
        self.cg.gather_and_send()
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
        res = requests.post(self.url, headers={"Content-Type": "application/json"}, data=payload)
        data = res.json()
        self.assertTrue(len(data) > 0)
        for key, value in data.items():
            self.assertTrue(isinstance(key, str))
            self.assertTrue(isinstance(value, float))

            dt = datetime.fromisoformat(key)
            self.assertTrue(dt.year, datetime.now().year)
            self.assertTrue(dt.month, datetime.now().month)
            self.assertTrue(dt.day, datetime.now().day)
