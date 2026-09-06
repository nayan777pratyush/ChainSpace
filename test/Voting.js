const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingApp", function () {
  let voting;
  let owner;
  let candidate2;
  let candidate3;
  let outsider;

  beforeEach(async function () {
    [owner, candidate2, candidate3, outsider] =
      await ethers.getSigners();

    const Voting = await ethers.getContractFactory("VotingApp");

    voting = await Voting.deploy([
      owner.address,
      candidate2.address,
      candidate3.address,
    ]);

    await voting.deployed();
  });

  it("recognizes every configured candidate", async function () {
    expect(await voting.validateCandidate(owner.address)).to.equal(true);
    expect(await voting.validateCandidate(candidate2.address)).to.equal(true);
    expect(await voting.validateCandidate(candidate3.address)).to.equal(true);
    expect(await voting.validateCandidate(outsider.address)).to.equal(false);
  });

  it("records votes and emits VoteCast", async function () {
    await expect(voting.voteForCandidates(candidate2.address))
      .to.emit(voting, "VoteCast")
      .withArgs(owner.address, candidate2.address, 1);

    expect(
      await voting.totalVotesFor(candidate2.address)
    ).to.equal(1);
  });

  it("rejects invalid candidates", async function () {
    await expect(
      voting.voteForCandidates(outsider.address)
    ).to.be.revertedWith("Not a valid candidate");
  });
});