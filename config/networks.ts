/** @format */

// V0.9 network set — Base + Optimism mainnets and testnets.
// Deprecated testnets (ARB_GOERLI, OPT_GOERLI, MATIC_MUMBAI) and
// ETH_SEPOLIA are intentionally omitted from the deployment maps below;
// they're not V0.9 targets. Future chains (Arbitrum One, Polygon PoS)
// should be added during beta when Uniswap V3 + Aave V3 + Compound V3
// addresses have been verified on those networks.
export type NetworkKeys =
  | "ETH_SEPOLIA" // retained for legacy code paths; not a V0.9 active target
  | "BASE_MAINNET"
  | "BASE_SEPOLIA"
  | "OPT_MAINNET"
  | "OPT_SEPOLIA";

export const DCAFactoryAddress: { [key in NetworkKeys]?: `0x${string}` } = {
  BASE_MAINNET: "0x2e3B00D7fBE45D2Ed134d6eff4D986c894Ad0DB8" as `0x${string}`,
  BASE_SEPOLIA: "" as `0x${string}`, // V0.9 deployment pending
  OPT_MAINNET: "" as `0x${string}`, // V0.9 deployment pending
  OPT_SEPOLIA: "" as `0x${string}`, // V0.9 deployment pending
  ETH_SEPOLIA: "0xbc25BbbFEb33a5B475E557D7cFDC0b35e3A5b538", // legacy
} as const;

export const DCAExecutorAddress: { [key in NetworkKeys]?: `0x${string}` } = {
  BASE_MAINNET: "0x48783E9c817eC2eBBCbdEFBf74FAA5aC552556Ba" as `0x${string}`,
  BASE_SEPOLIA: "" as `0x${string}`,
  OPT_MAINNET: "" as `0x${string}`,
  OPT_SEPOLIA: "" as `0x${string}`,
  ETH_SEPOLIA: "0xa2b8a19a8a10C2fde3337CC64827C43c8E838541",
} as const;

export const DCAReinvestAddress: { [key in NetworkKeys]?: `0x${string}` } = {
  BASE_MAINNET: "0x43EF37d64178E7d8DB72843E4d13608e4E5E18bf" as `0x${string}`,
  BASE_SEPOLIA: "" as `0x${string}`,
  OPT_MAINNET: "" as `0x${string}`,
  OPT_SEPOLIA: "" as `0x${string}`,
  ETH_SEPOLIA: "0x27df786e26C825dc183Da89C2Efd824cf2477161",
} as const;

// V0.9 launch targets — gated in the UI. ETH_SEPOLIA is NOT in this list
// (deliberately; we moved testnet to BASE_SEPOLIA + OPT_SEPOLIA).
export const SUPPORTED_NETWORKS = [
  "BASE_MAINNET",
  "BASE_SEPOLIA",
  "OPT_MAINNET",
  "OPT_SEPOLIA",
] as const;
