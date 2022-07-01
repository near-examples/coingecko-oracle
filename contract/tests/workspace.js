import { Worker } from "near-workspaces";
import path from "path";
import test from "ava";

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;

  // Deploy the contract.
  const cg_oracle = await root.createAndDeploy(
    root.getSubAccount("cg-oracle").accountId,
    path.join("build", "main.wasm")
  );
  // Init the contract
  await cg_oracle.call(cg_oracle, "init", {});

  // Create test accounts
  const alice = await root.createSubAccount("alice");

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = {
    root,
    cg_oracle,
    alice,
  };
});

test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

export default test;
