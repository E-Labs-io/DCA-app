/** @format */

export type NetworkKeys =
  | "ETH_SEPOLIA"
  | "ARB_GOERLI"
  | "OPT_GOERLI"
  | "MATIC_MUMBAI";

export const DCAFactoryAddress: { [key in NetworkKeys]?: `0x${string}` } = {
  ETH_SEPOLIA: "0xbc25BbbFEb33a5B475E557D7cFDC0b35e3A5b538",
  ARB_GOERLI: "" as `0x${string}`,
  OPT_GOERLI: "" as `0x${string}`,
  MATIC_MUMBAI: "" as `0x${string}`,
} as const;

export const DCAExecutorAddress: { [key in NetworkKeys]?: `0x${string}` } = {
  ETH_SEPOLIA: "0xa2b8a19a8a10C2fde3337CC64827C43c8E838541",
  ARB_GOERLI: "" as `0x${string}`,
  OPT_GOERLI: "" as `0x${string}`,
  MATIC_MUMBAI: "" as `0x${string}`,
} as const;

export const DCAReinvestAddress: { [key in NetworkKeys]?: `0x${string}` } = {
  ETH_SEPOLIA: "0x27df786e26C825dc183Da89C2Efd824cf2477161",
  ARB_GOERLI: "" as `0x${string}`,
  OPT_GOERLI: "" as `0x${string}`,
  MATIC_MUMBAI: "" as `0x${string}`,
} as const;

export const SUPPORTED_NETWORKS = ["ETH_SEPOLIA"] as const;
