const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found.");
  }

  const env = {};

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);

    env[key] = value;
  }

  return env;
}

async function main() {
  const env = loadEnvFile();

  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const addresses = {
    greeter: env.NEXT_PUBLIC_GREETER_ADDRESS,
    token: env.NEXT_PUBLIC_TOKEN_ADDRESS,
    voting: env.NEXT_PUBLIC_VOTING_ADDRESS,
  };

  for (const [name, address] of Object.entries(addresses)) {
    if (!ethers.utils.isAddress(address)) {
      throw new Error(`${name} address is missing or invalid: ${address}`);
    }

    const code = await provider.getCode(address);

    if (code === "0x") {
      throw new Error(`${name} contract not found at ${address}`);
    }

    console.log(`✓ ${name} contract code detected: ${address}`);
  }

  const Greeter = require("../Components/artifacts/contracts/Greeter.sol/Greeter.json");
  const Token = require("../Components/artifacts/contracts/Token.sol/Token.json");
  const Voting = require("../Components/artifacts/contracts/Voting.sol/VotingApp.json");

  const greeter = new ethers.Contract(
    addresses.greeter,
    Greeter.abi,
    provider
  );

  const token = new ethers.Contract(
    addresses.token,
    Token.abi,
    provider
  );

  const voting = new ethers.Contract(
    addresses.voting,
    Voting.abi,
    provider
  );

  console.log("✓ Greeter:", await greeter.greet());

  const [deployer] = await provider.listAccounts();
  const balance = await token.balanceOf(deployer);

  console.log("✓ Token balance:", balance.toString());

  const candidates = await voting.getCandidates();

  console.log("✓ Voting candidates:", candidates);

  console.log("\nChainSpace local smoke check passed.");
}

main().catch((error) => {
  console.error("\n✗ Smoke check failed:");
  console.error(error.message);
  process.exitCode = 1;
});