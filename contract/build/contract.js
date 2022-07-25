function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function call(target, key, descriptor) {}
function view(target, key, descriptor) {}
function NearBindgen(target) {
  return class extends target {
    static _init() {
      // @ts-ignore
      let args = target.deserializeArgs();
      let ret = new target(args); // @ts-ignore

      ret.serialize();
      return ret;
    }

    static _get() {
      let ret = Object.create(target.prototype);
      return ret;
    }

  };
}

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
function signerAccountId() {
  env.signer_account_id(0);
  return env.read_register(0);
}
function storageRead(key) {
  let ret = env.storage_read(key, 0);

  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}
function input() {
  env.input(0);
  return env.read_register(0);
}
var PromiseResult;

(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
function storageWrite(key, value) {
  let exist = env.storage_write(key, value, EVICTED_REGISTER);

  if (exist === 1n) {
    return true;
  }

  return false;
}

class NearContract {
  deserialize() {
    let state = storageRead("STATE");

    if (state) {
      Object.assign(this, JSON.parse(state));
    } else {
      throw new Error("Contract state is empty");
    }
  }

  serialize() {
    storageWrite("STATE", JSON.stringify(this));
  }

  static deserializeArgs() {
    let args = input();
    return JSON.parse(args || "{}");
  }

  static serializeReturn(ret) {
    return JSON.stringify(ret);
  }

}

var _class, _class2;
const AUTHORIZED_ACCOUNT = "coingecko-feed.idea404.testnet";
const TEST_ACCOUNT = "test.near";

let Contract = NearBindgen(_class = (_class2 = class Contract extends NearContract {
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


  addPrices(request_data) {
    assert(signerAccountId() === AUTHORIZED_ACCOUNT || signerAccountId() === TEST_ACCOUNT, `Account ${signerAccountId()} unathourized to add data to smart contract.`);
    this.near_prices = { ...this.near_prices,
      ...request_data["data"]
    };
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


  getPrices() {
    const result = { ...this.near_prices
    };
    return result;
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "addPrices", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "addPrices"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getPrices", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "getPrices"), _class2.prototype)), _class2)) || _class;

function init() {
  Contract._init();
}
function getPrices() {
  let _contract = Contract._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.getPrices(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function addPrices() {
  let _contract = Contract._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.addPrices(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

export { addPrices, getPrices, init };
//# sourceMappingURL=contract.js.map
