/** @format */

type NetworkKeys =
  | "ETH_MAINNET"
  | "ETH_GOERLI"
  | "ETH_SEPOLIA"
  | "OPT_MAINNET"
  | "OPT_GOERLI"
  | "OPT_SEPOLIA"
  | "ARB_MAINNET"
  | "ARB_GOERLI"
  | "MATIC_MAINNET"
  | "MATIC_MUMBAI"
  | "BASE_MAINNET"
  | "BASE_SEPOLIA";

type ChainName =
  | "eth"
  | "ethGoerli"
  | "ethSepolia"
  | "arbitrum"
  | "arbGoerli"
  | "arbSepolia"
  | "optimism"
  | "opGoerli"
  | "matic"
  | "maticMumbai"
  | "baseMainnet"
  | "baseSepolia"
  | "hardhat"
  | "localhost";

type ChainsIcons = {
  [chain in NetworkKeys]?: { icon: string; toolTip: string };
};

type ActiveChainIndex = {
  [chain in NetworkKeys]?: boolean;
};

type ChainNumbers = {
  [chain in NetworkKeys]?: {
    number: number;
    name: string;
    ticker: string;
    alchemyKey: string;
    rpcUrl: string;
    explorerUrl: string;
  };
};

type EtherscanLinks = { [chain in NetworkKeys]?: string };

interface IChainData {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  chain_id: number;
  network_id: number;
  rpc_url: string;
  native_currency: any;
}

export type {
  NetworkKeys,
  ChainsIcons,
  ActiveChainIndex,
  ChainNumbers,
  EtherscanLinks,
  IChainData,
  ChainName,
};
