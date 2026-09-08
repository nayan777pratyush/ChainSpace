const hre = require("hardhat");

async function main() {
  const [candidateA, candidateB, candidateC] = await hre.ethers.getSigners();

  const Voting = await hre.ethers.getContractFactory("VotingApp");
  const voting = await Voting.deploy([
    candidateA.address,
    candidateB.address,
    candidateC.address,
  ]);

  await voting.deployed();

  console.log("ChainSpace VotingApp:", voting.address);
  console.log(
    "Candidates:",
    candidateA.address,
    candidateB.address,
    candidateC.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
