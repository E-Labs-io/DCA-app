/** @format */
import { NetworkKeys } from "@/types/Chains";

import { ActiveChainIndex } from "@/types";
import { NetworkNameToChainID } from "./avalabuleChains";

const availableChains: Readonly<ActiveChainIndex> = {
  ETH_MAINNET: false,
  OPT_MAINNET: false,
  ARB_MAINNET: false,
  MATIC_MAINNET: false,
  ETH_GOERLI: false,
  OPT_GOERLI: true,
  ARB_GOERLI: false,
  MATIC_MUMBAI: false,
  BASE_MAINNET: true,
};

const web3ModalChains: modalChains = {
  MATIC_MUMBAI: {
    chainId: NetworkNameToChainID.MATIC_MUMBAI!.number,
    name: NetworkNameToChainID.MATIC_MUMBAI!.name,
    currency: "MATIC",
    explorerUrl: NetworkNameToChainID.MATIC_MUMBAI!.explorerUrl,
    rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MATICMUMBAI_KEY}`,
    colour: "#6600FF",
    icon: "/icons/chains/Polygon.png",
  },
  ETH_SEPOLIA: {
    chainId: NetworkNameToChainID.ETH_SEPOLIA!.number,
    name: NetworkNameToChainID.ETH_SEPOLIA!.name,
    currency: "ETH",
    explorerUrl: NetworkNameToChainID.ETH_SEPOLIA!.explorerUrl,
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    colour: "#8248E5",
    icon: "/icons/chains/Ethereum.png",
  },
  OPT_MAINNET: {
    chainId: NetworkNameToChainID.OPT_MAINNET!.number,
    name: NetworkNameToChainID.OPT_MAINNET!.name,
    currency: "OP",
    explorerUrl: NetworkNameToChainID.OPT_MAINNET!.explorerUrl,
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    colour: "#ff0000",
    icon: "/icons/chains/Optimism.png",
  },
  BASE_MAINNET: {
    chainId: NetworkNameToChainID.BASE_MAINNET!.number,
    name: NetworkNameToChainID.BASE_MAINNET!.name,
    currency: "ETH",
    explorerUrl: NetworkNameToChainID.BASE_MAINNET!.explorerUrl,
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    colour: "#0052FF",
    icon: "/icons/chains/Base.png", // You'll need to add this icon
  },
};

export type modalChains = {
  [chain in NetworkKeys]?: {
    chainId: number;
    name: string;
    currency: string;
    explorerUrl: string;
    rpcUrl: string;
    colour: string;
    icon: string;
  };
};

export { availableChains, web3ModalChains };
