const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

function writeLocalFrontendEnv(addresses) {
  const envPath = path.join(process.cwd(), ".env.local");

  const content = [
    "NEXT_PUBLIC_CHAIN_ID=1337",
    "NEXT_PUBLIC_NETWORK_NAME=Hardhat Local",
    "",
    `NEXT_PUBLIC_GREETER_ADDRESS=${addresses.greeter}`,
    `NEXT_PUBLIC_TOKEN_ADDRESS=${addresses.token}`,
    `NEXT_PUBLIC_VOTING_ADDRESS=${addresses.voting}`,
    "",
    "NEXT_PUBLIC_EXPLORER_URL=",
    "",
  ].join("\n");

  fs.writeFileSync(envPath, content, "utf8");
  console.log("✓ Updated .env.local with fresh local contract addresses.");
}

async function main() {
  const [deployer, candidate2, candidate3] =
    await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);
  console.log("Network:", hre.network.name);

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

  const BankAccount = await hre.ethers.getContractFactory("BankAccount");
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

  const Wallet = await hre.ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy();
  await wallet.deployed();

  const addresses = {
    greeter: greeter.address,
    token: token.address,
    voting: voting.address,
    counter: counter.address,
    bank: bank.address,
    registry: registry.address,
    todo: todo.address,
    wallet: wallet.address,
  };

  console.log("\n=== DEPLOYED CONTRACTS ===");
  Object.entries(addresses).forEach(([name, address]) => {
    console.log(`${name}:`, address);
  });

  console.log("\n=== FRONTEND ENV ===");
  console.log(`NEXT_PUBLIC_GREETER_ADDRESS=${addresses.greeter}`);
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${addresses.token}`);
  console.log(`NEXT_PUBLIC_VOTING_ADDRESS=${addresses.voting}`);

  // Only overwrite the local frontend environment during a localhost deployment.
  // Sepolia credentials are never written to frontend files.
  if (hre.network.name === "localhost") {
    writeLocalFrontendEnv(addresses);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
