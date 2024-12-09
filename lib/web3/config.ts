import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';

// Configuration for different networks
export const NETWORKS = {
  MAINNET: {
    chainId: 1,
    name: 'Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
    explorer: 'https://etherscan.io',
  },
  // Add other networks as needed
};

// Alchemy configuration
const alchemyConfig = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

export const alchemy = new Alchemy(alchemyConfig);

// Provider setup
export const getProvider = () => {
  if (!process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL) {
    throw new Error('Alchemy RPC URL not configured');
  }
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
};

// Contract addresses
export const CONTRACT_ADDRESSES = {
  DCA_MANAGER: process.env.NEXT_PUBLIC_DCA_MANAGER_ADDRESS,
  // Add other contract addresses as needed
}; 