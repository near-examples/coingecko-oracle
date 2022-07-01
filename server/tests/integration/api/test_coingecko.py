import unittest
from datetime import datetime

from server.src.main import CGFeeder


class TestCoinGecko(unittest.TestCase):
    def setUp(self) -> None:
        self.cg = CGFeeder()

    def tearDown(self) -> None:
        self.cg.close()

    def test_get_price(self):
        data = self.cg.get_data()
        self.assertTrue(len(data) > 0)
        self.assertTrue("data" in data)
        self.assertTrue(len(data["data"]) > 0)
        for key, value in data["data"].items():
            self.assertTrue(isinstance(key, str))
            self.assertTrue(isinstance(value, float))

            dt = datetime.fromisoformat(key)
            self.assertTrue(dt.year, datetime.now().year)
            self.assertTrue(dt.month, datetime.now().month)
            self.assertTrue(dt.day, datetime.now().day)
