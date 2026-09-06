const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
  let token;
  let owner;
  let recipient;

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(1000);
    await token.deployed();
  });

  it("assigns the initial supply to the deployer", async function () {
    expect(await token.totalSupply()).to.equal(1000);
    expect(await token.balanceOf(owner.address)).to.equal(1000);
  });

  it("transfers tokens and emits Transfer", async function () {
    await expect(token.transfer(recipient.address, 125))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, recipient.address, 125);

    expect(await token.balanceOf(owner.address)).to.equal(875);
    expect(await token.balanceOf(recipient.address)).to.equal(125);
  });

  it("rejects transfers larger than the balance", async function () {
    await expect(token.transfer(recipient.address, 1001))
      .to.be.revertedWith("Not enough tokens");
  });
});