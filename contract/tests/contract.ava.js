import "ava";
import test from "./workspace.js";

test("adding data from wrong account", async (t) => {
  const { alice, cg_oracle } = t.context.accounts;

  const result = await alice.callRaw(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1969-12-31T23:03:45.000Z": 111.11,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  t.regex(
    result.receiptFailureMessages.join("\n"),
    /Account alice.test.near unathourized to add data to smart contract/
  );
});

test("adding data", async (t) => {
  const { root, cg_oracle } = t.context.accounts;

  await root.call(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1969-12-31T23:03:45.000Z": 111.11,
        "1970-01-01T23:03:45.000Z": 116.11,
        "1970-01-02T23:03:45.000Z": 126.11,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  t.log(root.accountId);

  const result = await cg_oracle.view("getPrices");
  t.log(result);

  const expected = {
    "1969-12-31T23:03:45.000Z": 111.11,
    "1970-01-01T23:03:45.000Z": 116.11,
    "1970-01-02T23:03:45.000Z": 126.11,
  };
  t.deepEqual(result, expected);
});

test("adding data twice", async (t) => {
  const { root, cg_oracle } = t.context.accounts;

  await root.call(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1969-12-31T23:03:45.000Z": 111.11,
        "1970-01-01T23:03:45.000Z": 116.11,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  await root.call(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1970-01-02T23:03:45.000Z": 126.11,
        "1970-01-03T23:03:45.000Z": 136.11,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  const result = await cg_oracle.view("getPrices");

  const expected = {
    "1969-12-31T23:03:45.000Z": 111.11,
    "1970-01-01T23:03:45.000Z": 116.11,
    "1970-01-02T23:03:45.000Z": 126.11,
    "1970-01-03T23:03:45.000Z": 136.11,
  };
  t.deepEqual(result, expected);
});

test("adding data for existing timestamp", async (t) => {
  const { root, cg_oracle } = t.context.accounts;

  await root.call(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1969-12-31T23:03:45.000Z": 111.11,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  await root.call(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1969-12-31T23:03:45.000Z": 131.11,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  const result = await cg_oracle.view("getPrices");

  const expected = {
    "1969-12-31T23:03:45.000Z": 131.11,
  };
  t.deepEqual(result, expected);
});

test("adding large numbers", async (t) => {
  const { root, cg_oracle } = t.context.accounts;

  const large_number = 2384762348723648237462231312321113.21321312313121231546431231122314474;

  await root.call(
    cg_oracle,
    "addPrices",
    {
      data: {
        "1969-12-31T23:03:45.000Z": large_number,
      },
    },
    { attachedDeposit: "400000000000000000000000" }
  );

  const result = await cg_oracle.view("getPrices");

  const expected = {
    "1969-12-31T23:03:45.000Z": large_number,
  };
  t.deepEqual(result, expected);
});
