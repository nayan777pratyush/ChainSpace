import { ethers } from 'ethers';

/**
 * Read a contract method without requiring a transaction or gas.
 */
export async function readContract(address, abi, method, args = []) {
  if (!address || !abi || !method) {
    throw new Error('Contract address, ABI and method are required.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(address, abi, provider);
  return contract.callStatic[method](...args);
}
