import { assert } from "./helpers";

import {
  NearContract,
  NearBindgen,
  call,
  view,
  near,
  UnorderedMap,
  Vector,
} from "near-sdk-js";

const AUTHORIZED_CONTRACT = "coingecko-feed.idea404.testnet";

@NearBindgen
class Contract extends NearContract {
  constructor() {
    super();
    this.near_prices = new Map();
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
      near.signerAccountId() === AUTHORIZED_CONTRACT,
      `Account ${near.signerAccountId()} unathourized to add data to smart contract.`
    );
    const fdata = JSON.parse(data);
    for (const datetimeString in fdata) {
      const datetime = new Date(datetimeString);
      this.near_prices.set(datetime, fdata[datetimeString]);
    }
  }

  /**
   * Returns a map of float prices indexed by datetime.
   * @from_datetime: string of datetime in ISO format, e.g. "2021-07-27T16:02:08.070557"
   * @return:
   *  {
   *     "2021-07-27T16:02:08.000000": {
   *      "ETH": 122.22,
   *      "NEAR": 20.11,
   *      ...
   *     },
   *     "2021-07-28T16:02:08.000000": {
   *      "ETH": 129.22,
   *      "NEAR": 21.11,
   *      ...
   *     },
   *     ...
   *  }
   */
  @view
  getPrices(from_datetime) {
    assert(
      from_datetime,
      'from_datetime must be provided, e.g. "2021-07-27T16:02:08.000000"'
    );
    const fdatetime = new Date(from_datetime); // "01-01-1970 00:03:45" ->  1969-12-31T23:03:45.000Z
    const result = new Map();
    for (const datetime in this.prices) {
        if (fdatetime <= datetime) {
            result.set(datetime, this.prices[datetime]);
        }
    }
    return result;
  }
}
