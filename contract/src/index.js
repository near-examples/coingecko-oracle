import { assert } from "./helpers";
import { NearBindgen, call, view, near } from "near-sdk-js";

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
  addPrices(request_data) {
    near.log('addPrices() called, request_data:', request_data);
    assert(
      near.signerAccountId() === AUTHORIZED_ACCOUNT ||
      near.signerAccountId() === TEST_ACCOUNT,
      `Account ${near.signerAccountId()} unathourized to add data to smart contract.`
    );
    this.near_prices = { ...this.near_prices, ...request_data["data"] };
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
  getPrices() {
    near.log('getPrices() called, this.near_prices:', this.near_prices);
    return this.near_prices;
  }

}
