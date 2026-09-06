import { ethers } from 'ethers';

/**
 * Send a contract transaction through the user's connected wallet.
 * The caller receives both the submitted transaction and its receipt.
 */
export async function sendContractTransaction(address, abi, method, args = []) {
  if (!address || !abi || !method) {
    throw new Error('Contract address, ABI and method are required.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  const transaction = await contract[method](...args);
  const receipt = await transaction.wait();

  return { transaction, receipt };
}

export function formatTransactionHash(hash) {
  return hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : '';
}
