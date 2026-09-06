import { ethers } from 'ethers';

/**
 * Read the latest block and expose the fields used by ChainSpace telemetry.
 */
export async function readBlock(blockTag = 'latest') {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask or another injected wallet is required.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const block = await provider.getBlock(blockTag);

  return {
    ...block,
    timestampDate: block.timestamp
      ? new Date(block.timestamp * 1000)
      : null,
  };
}
