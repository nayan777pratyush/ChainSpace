const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  let greeter;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Greeter = await ethers.getContractFactory("Greeter");
    greeter = await Greeter.deploy("Hello, ChainSpace");
    await greeter.deployed();
  });

  it("stores the initial greeting", async function () {
    expect(await greeter.greet()).to.equal("Hello, ChainSpace");
  });

  it("changes the greeting and emits an event", async function () {
    await expect(greeter.setGreeting("Hello Blockchain"))
      .to.emit(greeter, "GreetingChanged")
      .withArgs(owner.address, "Hello, ChainSpace", "Hello Blockchain");

    expect(await greeter.greet()).to.equal("Hello Blockchain");
  });

  it("rejects an empty greeting", async function () {
    await expect(greeter.setGreeting("")).to.be.revertedWith(
      "Greeting cannot be empty"
    );
  });
});