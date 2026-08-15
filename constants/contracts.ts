/** @format */

import { NetworkKeys } from "@/types";

// V0.9: Base + Optimism — mainnet and sepolia testnets.
// BASE_MAINNET addresses are live from V0.8.
// BASE_SEPOLIA / OPT_MAINNET / OPT_SEPOLIA pending V0.9 contract deployment.
// ETH_SEPOLIA retained for reference but dropped from ACTIVE_CHAIN below.

const DCAFactoryAddress: { [key in NetworkKeys]?: string } = {
  BASE_MAINNET: "0x2e3B00D7fBE45D2Ed134d6eff4D986c894Ad0DB8",
  BASE_SEPOLIA: "0xd53042EC2BA9Ef26D9ac6D936bc9906Cf98b3495", // V0.9 #2 2026-08-15
  OPT_MAINNET: "",
  OPT_SEPOLIA: "",
  ETH_SEPOLIA: "0xe538fE1d89E4d1cd316AdC213c7503E303f45449", // legacy
};

const DCAExecutorAddress: { [key in NetworkKeys]?: string } = {
  BASE_MAINNET: "0x48783E9c817eC2eBBCbdEFBf74FAA5aC552556Ba",
  BASE_SEPOLIA: "0x492AA09e58401e984C77f91924ab0B5aaD9fad1D", // V0.9 #2 2026-08-15
  OPT_MAINNET: "",
  OPT_SEPOLIA: "",
  ETH_SEPOLIA: "0x3D932bE6907ef00670B8e5aB48047C56f54e4441", // legacy
};

const DCAReinvestAddress: { [key in NetworkKeys]?: string } = {
  BASE_MAINNET: "0x8D712F7C47bA36A18119822eFAF108E1F9F6cBAD",
  BASE_SEPOLIA: "0x34f222790BEC2838c23CA24E332954A0dF375326", // V0.9 #2 2026-08-15
  OPT_MAINNET: "",
  OPT_SEPOLIA: "",
  ETH_SEPOLIA: "0x4Ed0010E4F9F65355c0DA02C4c60415A93f40Fb2", // legacy
};

// Networks the UI treats as active. V0.9 launch lineup.
// BASE_MAINNET + OPT_MAINNET for production, BASE_SEPOLIA + OPT_SEPOLIA
// for testing. ETH_SEPOLIA dropped as of V0.9.
// V0.9 MVP: Base only. Optimism is fast-follow once Base is proven on
// mainnet — adding OPT_* back here is the only app-side change needed
// (plus their deployed addresses). BASE_SEPOLIA stays for the dress
// rehearsal; remove it from the list if you want a mainnet-only app.
const ACTIVE_CHAIN: NetworkKeys[] = ["BASE_MAINNET", "BASE_SEPOLIA"];

export {
  DCAExecutorAddress,
  DCAFactoryAddress,
  ACTIVE_CHAIN,
  DCAReinvestAddress,
};
