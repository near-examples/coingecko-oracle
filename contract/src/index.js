import { call, near, NearBindgen, view } from "near-sdk-js";
import { assert } from "./helpers";

const AUTHORIZED_ACCOUNT = "coingecko-feed.idea404.testnet";
const TEST_ACCOUNT = "test.near";

@NearBindgen({})
class Contract {
  constructor() {
    this.near_prices = {};
  }

  /**
   * Adds price data to smart contract.
   * @data: map of datetime string and price values floats, as:
   *  {
   *    "01-01-1970 00:03:45": 200.22,
   *    "01-02-1970 00:03:45": 202.22,
   *    ...
   *  }
   */
  @call({ payableFunction: true })
  addPrices({ data }) {
    assert(near.signerAccountId() === AUTHORIZED_ACCOUNT || near.signerAccountId() === TEST_ACCOUNT, `Account ${near.signerAccountId()} unathourized to add data to smart contract.`);
    near.log(`Adding prices from ${near.signerAccountId()} to smart contract. Data: ${JSON.stringify(data)}`);
    this.near_prices = { ...this.near_prices, ...data };
  }

  /**
   * Returns a map of float prices indexed by datetime.
   * @from_datetime: string of datetime in ISO format, e.g. "2021-07-27T16:02:08.070557"
   * @return:
   *  {
   *     "2021-07-27T16:02:08.000000": 122.22,
   *     "2021-07-28T16:02:08.000000": 129.22,
   *     ...
   *  }
   */
  @view({})
  getPrices({}) {
    const prices = { ...this.near_prices };
    return prices;
  }
}
