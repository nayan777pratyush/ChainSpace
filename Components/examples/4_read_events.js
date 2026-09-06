import { ethers } from 'ethers';

/**
 * Query historical events from a contract over a block range.
 */
export async function readSmartContractEvents(
  address,
  abi,
  eventName,
  fromBlock = 0,
  toBlock = 'latest'
) {
  if (!address || !abi || !eventName) {
    throw new Error('Contract address, ABI and event name are required.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(address, abi, provider);
  return contract.queryFilter(eventName, fromBlock, toBlock);
}
