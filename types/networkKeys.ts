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
  [chain in NetworkKeys]?: {
    icon: string;
    toolTip: string;
  };
};
