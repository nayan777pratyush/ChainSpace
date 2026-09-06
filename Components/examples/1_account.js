import { ethers } from 'ethers';

/**
 * Read the connected wallet address and native ETH balance.
 * This utility is intentionally provider-only: it never asks for a
 * private key or stores credentials in source code.
 */
export async function getUserAccount() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask or another injected wallet is required.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);

  return {
    address,
    balance,
    formattedBalance: ethers.utils.formatEther(balance),
  };
}
