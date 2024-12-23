/** @format */

import { StaticImageData } from "next/image";
import { NetworkKeys } from "../config/networks";
import { AddressLike } from "ethers";

export type TokenTickers = "USDC" | "USDT" | "DAI" | "WETH" | "WBTC";

export interface TokenData {
  ticker: string;
  contractAddress: { [network in NetworkKeys]?: AddressLike };
  decimals: number;
  label: string;
  name: string;
  icon: string;
}

export interface TokenList {
  WETH: TokenData;
  USDC: TokenData;
  USDT: TokenData;
  DAI: TokenData;
  WBTC: TokenData;
}

export const tokenList: TokenList = {
  WETH: {
    ticker: "WETH",
    contractAddress: {
      ETH_SEPOLIA: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
    },
    decimals: 18,
    label: "Wrapped Ether",
    name: "weth",
    icon: "/icons/tokens/eth.png",
  },
  USDC: {
    ticker: "USDC",
    contractAddress: {
      ETH_SEPOLIA: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    },
    decimals: 6,
    label: "USDC",
    name: "usdc",
    icon: "/icons/tokens/usdc.png",
  },
  USDT: {
    ticker: "USDT",
    contractAddress: {
      ETH_SEPOLIA: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    },
    decimals: 6,
    label: "Tether USD",
    name: "tether",
    icon: "/icons/tokens/usdt.png",
  },
  DAI: {
    ticker: "DAI",
    contractAddress: {
      ETH_SEPOLIA: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    },
    decimals: 18,
    label: "DAI",
    name: "dai",
    icon: "/icons/tokens/dai.png",
  },
  WBTC: {
    ticker: "WBTC",
    contractAddress: {
      ETH_SEPOLIA: "0x29f2D40B0605204364af54EC677bD022dA425d03",
    },
    decimals: 8,
    label: "Wrapped Bitcoin",
    name: "wrapped-bitcoin",
    icon: "/icons/tokens/wbtc.png",
  },
};
