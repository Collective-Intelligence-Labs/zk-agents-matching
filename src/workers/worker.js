import {
  Account,
  ProgramManager,
  PrivateKey,
  initThreadPool,
  AleoKeyProvider,
  AleoNetworkClient,
  NetworkRecordProvider,
} from "@aleohq/sdk";
import { expose, proxy } from "comlink";

await initThreadPool();



async function programExecution(program, aleoFunction, inputs, privateKey) {

  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  // Create a record provider that will be used to find records and transaction data for Aleo programs
  const networkClient = new AleoNetworkClient("https://vm.aleo.org/api");

  // Use existing account with funds
  const account = new Account({
    privateKey: privateKey,
  });

  const recordProvider = new NetworkRecordProvider(account, networkClient);
  const programManager = new ProgramManager(
    "https://vm.aleo.org/api",
    keyProvider,
    recordProvider,
  );

  programManager.setAccount(account);
  const s = await programManager.verifyProgram(program);
  console.log(s);
  const fee = 5000; // 1.9 Aleo credits
  const executionResponse = await programManager.execute(
    program,
    aleoFunction,
    inputs,
    false
  );
  return executionResponse.getOutputs();
}


async function localProgramExecution(program, aleoFunction, inputs, privateKey) {
  const programManager = new ProgramManager();

  // Create a temporary account for the execution of the program
  const account = new Account({
    privateKey: privateKey,
  });
  programManager.setAccount(account);

  const executionResponse = await programManager.executeOffline(
    program,
    aleoFunction,
    inputs,
    false,
  );
  return executionResponse.getOutputs();
}

async function createPrivateKey() {
  const key = new PrivateKey();
  return proxy(key);
}

async function deployProgram(program) {
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  // Create a record provider that will be used to find records and transaction data for Aleo programs
  const networkClient = new AleoNetworkClient("https://vm.aleo.org/api");

  // Use existing account with funds
  const account = new Account({
    privateKey: "APrivateKey1zkpAXoVC8gAr6QYGDmC2G8s6b4BJbjXVfz19gLcyuLU2XK5",
  });

  const recordProvider = new NetworkRecordProvider(account, networkClient);

  // Initialize a program manager to talk to the Aleo network with the configured key and record providers
  const programManager = new ProgramManager(
    "https://vm.aleo.org/api",
    keyProvider,
    recordProvider,
  );

  programManager.setAccount(account);

  // Define a fee to pay to deploy the program
  const fee = 5000; // 1.9 Aleo credits

  // Deploy the program to the Aleo network
  const tx_id = await programManager.deploy(program, fee);

  // Optional: Pass in fee record manually to avoid long scan times
  // const feeRecord = "{  owner: aleo1xxx...xxx.private,  microcredits: 2000000u64.private,  _nonce: 123...789group.public}";
  // const tx_id = await programManager.deploy(program, fee, undefined, feeRecord);

  return tx_id;
}

const workerMethods = { localProgramExecution, createPrivateKey, deployProgram };
expose(workerMethods);
