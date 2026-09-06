const hre = require('hardhat');

async function main() {
  const Token = await hre.ethers.getContractFactory('Token');
  const token = await Token.deploy(1_000_000);
  await token.deployed();

  console.log('ChainSpace Token:', token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
