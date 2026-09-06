const hre = require("hardhat");

async function main() {
  const [deployer, candidate2, candidate3] =
    await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Welcome to ChainSpace");
  await greeter.deployed();

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(1000000);
  await token.deployed();

  const Voting = await hre.ethers.getContractFactory("VotingApp");
  const voting = await Voting.deploy([
    deployer.address,
    candidate2.address,
    candidate3.address,
  ]);
  await voting.deployed();

  const Counter = await hre.ethers.getContractFactory("CounterContract");
  const counter = await Counter.deploy(0);
  await counter.deployed();

  const BankAccount =
    await hre.ethers.getContractFactory("BankAccount");
  const bank = await BankAccount.deploy();
  await bank.deployed();

  const DocumentRegistry =
    await hre.ethers.getContractFactory("DocumentRegistry");
  const registry = await DocumentRegistry.deploy();
  await registry.deployed();

  const ToDoContract =
    await hre.ethers.getContractFactory("ToDoContract");
  const todo = await ToDoContract.deploy();
  await todo.deployed();

  const Wallet =
    await hre.ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy();
  await wallet.deployed();

  console.log("\n=== DEPLOYED CONTRACTS ===");
  console.log("Greeter:", greeter.address);
  console.log("Token:", token.address);
  console.log("Voting:", voting.address);
  console.log("Counter:", counter.address);
  console.log("BankAccount:", bank.address);
  console.log("DocumentRegistry:", registry.address);
  console.log("ToDoContract:", todo.address);
  console.log("Wallet:", wallet.address);

  console.log("\n=== FRONTEND ENV ===");
  console.log(`NEXT_PUBLIC_GREETER_ADDRESS=${greeter.address}`);
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${token.address}`);
  console.log(`NEXT_PUBLIC_VOTING_ADDRESS=${voting.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});