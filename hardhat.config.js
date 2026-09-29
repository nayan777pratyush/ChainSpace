require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

const networks = {
  hardhat: {
    chainId: 1337,
  },
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 1337,
  },
};

if (process.env.SEPOLIA_RPC_URL && process.env.DEPLOYER_PRIVATE_KEY) {
  networks.sepolia = {
    url: process.env.SEPOLIA_RPC_URL,
    chainId: 11155111,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
  };
}

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./Components/artifacts",
  },
  networks,
};
