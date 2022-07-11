import json
import unittest
from datetime import datetime

from server.src.main import CGFeeder
from server.src.utils import FEED_ACCOUNT_ID, TEST_ORACLE_ACCOUNT_ID


class TestCoinGecko(unittest.TestCase):
    def setUp(self) -> None:
        self.cg = CGFeeder(TEST_ORACLE_ACCOUNT_ID, FEED_ACCOUNT_ID)

    def tearDown(self) -> None:
        self.cg.close()

    def test_get_price(self):
        data_str = self.cg.get_data()
        self.assertTrue(len(data_str) > 0)
        data = json.loads(data_str)
        self.assertTrue(len(data) > 0)
        for key, value in data.items():
            self.assertTrue(isinstance(key, str))
            self.assertTrue(isinstance(value, float))

            dt = datetime.fromisoformat(key)
            self.assertTrue(dt.year, datetime.now().year)
            self.assertTrue(dt.month, datetime.now().month)
            self.assertTrue(dt.day, datetime.now().day)
