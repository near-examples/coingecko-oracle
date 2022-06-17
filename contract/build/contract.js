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

function call(target, name, descriptor) {
  return descriptor;
}
function view(target, name, descriptor) {
  return descriptor;
}
function NearBindgen(Class) {
  let OriginalClass = Class;

  let NewClass = function () {
    let args = OriginalClass.deserializeArgs();
    let ret = new OriginalClass(...args);
    ret.serialize();
    return ret;
  };

  NewClass.prototype = OriginalClass.prototype;

  NewClass._get = function () {
    let ret = Object.create(NewClass.prototype);
    return ret;
  };

  return NewClass;
}

class NearContract {
  deserialize() {
    let hasRead = env.jsvm_storage_read('STATE', 0);

    if (hasRead != 0) {
      let state = env.read_register(0);
      Object.assign(this, JSON.parse(state));
    } else throw new Error('Contract state is empty');
  }

  serialize() {
    env.jsvm_storage_write('STATE', JSON.stringify(this), 0);
  }

  static deserializeArgs() {
    env.jsvm_args(0);
    let args = env.read_register(0);
    return JSON.parse(args || '[]');
  }

  static serializeReturn(ret) {
    return JSON.stringify(ret);
  }

}

function signerAccountId() {
  env.signer_account_id(0);
  return env.read_register(0);
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
  new Contract();
}
function getPrices() {
  let _contract = Contract._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.getPrices(...args);
  if (ret !== undefined) env.jsvm_value_return(_contract.constructor.serializeReturn(ret));
}
function addPrices() {
  let _contract = Contract._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.addPrices(...args);

  _contract.serialize();

  if (ret !== undefined) env.jsvm_value_return(_contract.constructor.serializeReturn(ret));
}

export { addPrices, getPrices, init };
//# sourceMappingURL=contract.js.map
