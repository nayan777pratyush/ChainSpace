const hre = require('hardhat');

async function main() {
  const Counter = await hre.ethers.getContractFactory('CounterContract');
  const counter = await Counter.deploy();
  await counter.deployed();

  console.log('ChainSpace CounterContract:', counter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
