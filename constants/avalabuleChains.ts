/** @format */

import {
  ActiveChainIndex,
  ChainNumbers,
  ChainsIcons,
  EtherscanLinks,
} from "@/types/Chains";

const availableChains: ActiveChainIndex = {
  ETH_MAINNET: true,
  OPT_MAINNET: true,
  ARB_MAINNET: true,
  MATIC_MAINNET: false,
  ETH_GOERLI: false,
  OPT_GOERLI: true,
  ARB_GOERLI: false,
  MATIC_MUMBAI: false,
};

const ChainIcons: ChainsIcons = {
  ETH_MAINNET: { icon: "/icons/ethereum-logo.svg", toolTip: "Ethereum" },
  OPT_MAINNET: { icon: "/icons/optimism-logo.svg", toolTip: "Optimism" },
  ARB_MAINNET: { icon: "/icons/arbitrum-logo.svg", toolTip: "Arbitrum" },
  MATIC_MAINNET: { icon: "/icons/polygon-logo.svg", toolTip: "Polygon" },
};

const etherscanPrefix: EtherscanLinks = {
  ETH_MAINNET: "https://etherscan.io",
  ETH_GOERLI: "https://goerli.etherscan.io",
  ETH_SEPOLIA: "https://sepolia.etherscan.io",
  MATIC_MAINNET: "https://polygonscan.com",
  MATIC_MUMBAI: "https://mumbai.polygonscan.com",
  ARB_MAINNET: "https://arbiscan.io/",
  ARB_GOERLI: "https://goerli.arbiscan.io",
  OPT_MAINNET: "https://optimistic.etherscan.io",
  OPT_GOERLI: "https://goerli-optimism.etherscan.io",
  OPT_SEPOLIA: "https://sepolia-optimism.etherscan.io",
  BASE_MAINNET: "https://basescan.org",
  BASE_SEPOLIA: "https://sepolia-explorer.base.org",
};

const OpenseaUrlEnpoints: EtherscanLinks = {
  ETH_MAINNET: "https://opensea.io/assets/ethereum",
  ETH_GOERLI: "https://testnets.opensea.io/assets/goerli",
  MATIC_MAINNET: "https://opensea.io/assets/matic",
  MATIC_MUMBAI: "https://testnets.opensea.io/assets/mumbai",
  ARB_MAINNET: "https://opensea.io/assets/arbitrum-nova",
  ARB_GOERLI: "",
  OPT_MAINNET: "https://opensea.io/assets/optimism",
  OPT_GOERLI: "",
};

const NetworkNameToChainID: ChainNumbers = {
  ETH_MAINNET: {
    number: 1,
    name: "ethereum",
    ticker: "ETH",
    alchemyKey: "mainnet",
    rpcUrl: "",
    explorerUrl: etherscanPrefix.ETH_MAINNET!,
  },
  ETH_SEPOLIA: {
    number: 11155111,
    name: "sepolia",
    ticker: "ETH",
    alchemyKey: "sepolia",
    rpcUrl: "",
    explorerUrl: etherscanPrefix.ETH_SEPOLIA!,
  },
  ARB_MAINNET: {
    number: 42161,
    name: "arbitrum",
    ticker: "arbETH",
    alchemyKey: "arbitrum",
    rpcUrl: "",
    explorerUrl: "",
  },
  ARB_GOERLI: {
    number: 421613,
    name: "arbitrum-goerli",
    ticker: "arbGorETH",
    alchemyKey: "arbitrum-goerli",
    rpcUrl: "",
    explorerUrl: "",
  },
  MATIC_MAINNET: {
    number: 137,
    name: "polygon",
    ticker: "MATIC",
    alchemyKey: "matic",
    rpcUrl: "",
    explorerUrl: etherscanPrefix.MATIC_MUMBAI!,
  },
  MATIC_MUMBAI: {
    number: 80001,
    name: "mumbai",
    ticker: "mumMATIC",
    alchemyKey: "matic-mumbai",
    rpcUrl: "",
    explorerUrl: "",
  },
  OPT_MAINNET: {
    number: 10,
    name: "optimism",
    ticker: "opETH",
    alchemyKey: "optimism",
    rpcUrl: "",
    explorerUrl: "",
  },
  OPT_GOERLI: {
    number: 420,
    name: "optimism-goerli",
    ticker: "opGorETH",
    alchemyKey: "optimism-goerli",
    rpcUrl: "",
    explorerUrl: "",
  },
  OPT_SEPOLIA: {
    number: 11155420,
    name: "optimism-sepolia",
    ticker: "opSepETH",
    alchemyKey: "optimism-sepolia",
    rpcUrl: "",
    explorerUrl: etherscanPrefix.OPT_SEPOLIA!,
  },
  BASE_MAINNET: {
    number: 8453,
    name: "base",
    ticker: "baseETH",
    alchemyKey: "base",
    rpcUrl: "",
    explorerUrl: "",
  },
  BASE_SEPOLIA: {
    number: 84532,
    name: "base-sepolia",
    ticker: "baseSepETH",
    alchemyKey: "base-sepolia",
    rpcUrl: "",
    explorerUrl: "",
  },
};

export {
  availableChains,
  ChainIcons,
  NetworkNameToChainID,
  etherscanPrefix,
  OpenseaUrlEnpoints,
};
