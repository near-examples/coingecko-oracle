import { assert } from "./helpers";

import { NearContract, NearBindgen, call, view, near } from "near-sdk-js";

const AUTHORIZED_CONTRACT = "coingecko-feed.idea404.testnet";
const TEST_CONTRACT = "test.near";

@NearBindgen
class Contract extends NearContract {
  constructor() {
    super();
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
  @call
  addPrices(data) {
    assert(
      near.signerAccountId() === AUTHORIZED_CONTRACT ||
        near.signerAccountId() === TEST_CONTRACT,
      `Account ${near.signerAccountId()} unathourized to add data to smart contract.`
    );
    this.near_prices =  {...this.near_prices, ...data["data"]};
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
  @view
  getPrices() {
    const result = { ...this.near_prices };
    return result;
  }
}
