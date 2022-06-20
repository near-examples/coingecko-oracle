import "ava";
import { Worker } from "near-workspaces";
import { readFile } from "fs/promises";
import test from "ava";

// TODO: make this function part of the npm package when it is available
function encodeCall(contract, method, args) {
  return Buffer.concat([
    Buffer.from(contract),
    Buffer.from([0]),
    Buffer.from(method),
    Buffer.from([0]),
    Buffer.from(JSON.stringify([args])),
  ]);
}

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the jsvm contract.
  const jsvm = await root.createAndDeploy(
    root.getSubAccount("jsvm").accountId,
    "./node_modules/near-sdk-js/res/jsvm.wasm"
  );

  // Deploy fungible token contract
  const contract = await root.createSubAccount("simple-cg-oracle");
  let ftContractBase64 = (await readFile("build/contract.base64")).toString();
  await contract.call(
    jsvm,
    "deploy_js_contract",
    Buffer.from(ftContractBase64, "base64"),
    { attachedDeposit: "400000000000000000000000" }
  );
  await contract.call(
    jsvm,
    "call_js_contract",
    encodeCall(contract.accountId, "init", ""),
    { attachedDeposit: "400000000000000000000000" }
  );

  // Create test accounts
  const alice = await root.createSubAccount("alice");

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = {
    root,
    jsvm,
    contract,
    alice,
  };
});

test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("adding data from wrong account", async (t) => {
  const { alice, jsvm, contract } = t.context.accounts;

  const result = await alice.callRaw(
    jsvm,
    "call_js_contract",
    encodeCall(contract.accountId, "addPrices", {
      data: {
        "1969-12-31T23:03:45.000Z": 111.11,
      },
    }),
    { attachedDeposit: "400000000000000000000000" }
  );

  t.regex(
    result.receiptFailureMessages.join("\n"),
    /Account alice.test.near unathourized to add data to smart contract/
  );
});

// test("adding data", async (t) => {
//   const { root, jsvm, contract } = t.context.accounts;

//   await root.call(
//     jsvm,
//     "call_js_contract",
//     encodeCall(contract.accountId, "addPrices", {
//       data : {
//         "1969-12-31T23:03:45.000Z": 111.11,
//         "1970-01-01T23:03:45.000Z": 116.11,
//         "1970-01-02T23:03:45.000Z": 126.11,
//       },
//     }),
//     { attachedDeposit: "400000000000000000000000" }
//   );

//   t.log(root.accountId);

//   const result = await jsvm.view(
//     "view_js_contract",
//     encodeCall(contract.accountId, "getPrices", {})
//   );
//   t.log(result);

//   const expected = {
//     '1969-12-31T23:03:45.000Z': 111.11,
//     '1970-01-01T23:03:45.000Z': 116.11,
//     '1970-01-02T23:03:45.000Z': 126.11,
//   };
//   t.deepEqual(result, expected);
// });

// test("adding data twice", async (t) => {
//   const { root, jsvm, contract } = t.context.accounts;

//   await root.call(
//     jsvm,
//     "call_js_contract",
//     encodeCall(contract.accountId, "addPrices", {
//       data : {
//         "1969-12-31T23:03:45.000Z": 111.11,
//         "1970-01-01T23:03:45.000Z": 116.11,
//       },
//     }),
//     { attachedDeposit: "400000000000000000000000" }
//   );

//   await root.call(
//     jsvm,
//     "call_js_contract",
//     encodeCall(contract.accountId, "addPrices", {
//       data : {
//         "1970-01-02T23:03:45.000Z": 126.11,
//         "1970-01-03T23:03:45.000Z": 136.11,
//       },
//     }),
//     { attachedDeposit: "400000000000000000000000" }
//   );

//   const result = await jsvm.view(
//     "view_js_contract",
//     encodeCall(contract.accountId, "getPrices", {})
//   );

//   const expected = {
//     '1969-12-31T23:03:45.000Z': 111.11,
//     '1970-01-01T23:03:45.000Z': 116.11,
//     '1970-01-02T23:03:45.000Z': 126.11,
//     "1970-01-03T23:03:45.000Z": 136.11,
//   };
//   t.deepEqual(result, expected);
// });

// test("adding data for existing timestamp", async (t) => {
//   const { root, jsvm, contract } = t.context.accounts;

//   await root.call(
//     jsvm,
//     "call_js_contract",
//     encodeCall(contract.accountId, "addPrices", {
//       data : {
//         "1969-12-31T23:03:45.000Z": 111.11,
//       },
//     }),
//     { attachedDeposit: "400000000000000000000000" }
//   );

//   await root.call(
//     jsvm,
//     "call_js_contract",
//     encodeCall(contract.accountId, "addPrices", {
//       data : {
//         "1969-12-31T23:03:45.000Z": 131.11,
//       },
//     }),
//     { attachedDeposit: "400000000000000000000000" }
//   );

//   const result = await jsvm.view(
//     "view_js_contract",
//     encodeCall(contract.accountId, "getPrices", {})
//   );

//   const expected = {
//     "1969-12-31T23:03:45.000Z": 131.11,
//   };
//   t.deepEqual(result, expected);
// });

// test("adding large numbers", async (t) => {
//   const { root, jsvm, contract } = t.context.accounts;

//   const large_number = 2384762348723648237462231312321113.21321312313121231546431231122314474;

//   await root.call(
//     jsvm,
//     "call_js_contract",
//     encodeCall(contract.accountId, "addPrices", {
//       data : {
//         "1969-12-31T23:03:45.000Z": large_number,
//       },
//     }),
//     { attachedDeposit: "400000000000000000000000" }
//   );

//   const result = await jsvm.view(
//     "view_js_contract",
//     encodeCall(contract.accountId, "getPrices", {})
//   );

//   const expected = {
//     "1969-12-31T23:03:45.000Z": large_number,
//   };
//   t.deepEqual(result, expected);
// });