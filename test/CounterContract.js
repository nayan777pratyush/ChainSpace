const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CounterContract", function () {
  it("increments and decrements safely", async function () {
    const Counter = await ethers.getContractFactory("CounterContract");
    const counter = await Counter.deploy(1);
    await counter.deployed();

    expect(await counter.getCount()).to.equal(1);

    await counter.addValue();
    expect(await counter.getCount()).to.equal(2);

    await counter.removeValue();
    expect(await counter.getCount()).to.equal(1);
  });

  it("does not go below zero", async function () {
    const Counter = await ethers.getContractFactory("CounterContract");
    const counter = await Counter.deploy(0);
    await counter.deployed();

    await expect(counter.removeValue()).to.be.revertedWith(
      "Value is already zero"
    );
  });
});