/** @format */

import { NetworkKeys } from "@/types";

const DCAFactoryAddress: { [key in NetworkKeys]?: string } = {
  ETH_SEPOLIA: "0xe538fE1d89E4d1cd316AdC213c7503E303f45449",
  ARB_GOERLI: "",
  OPT_GOERLI: "",
  BASE_MAINNET: "0x2e3B00D7fBE45D2Ed134d6eff4D986c894Ad0DB8",
};

const DCAExecutorAddress: { [key in NetworkKeys]?: string } = {
  ETH_SEPOLIA: "0x3D932bE6907ef00670B8e5aB48047C56f54e4441",
  ARB_GOERLI: "",
  OPT_GOERLI: "",
  BASE_MAINNET: "0x48783E9c817eC2eBBCbdEFBf74FAA5aC552556Ba",
};

const DCAReinvestAddress: { [key in NetworkKeys]?: string } = {
  ETH_SEPOLIA: "0x4Ed0010E4F9F65355c0DA02C4c60415A93f40Fb2",
  ARB_GOERLI: "",
  OPT_GOERLI: "",
  MATIC_MUMBAI: "",
  BASE_MAINNET: "0x8D712F7C47bA36A18119822eFAF108E1F9F6cBAD",
};

const ACTIVE_CHAIN: NetworkKeys[] = ["BASE_MAINNET"];

export {
  DCAExecutorAddress,
  DCAFactoryAddress,
  ACTIVE_CHAIN,
  DCAReinvestAddress,
};
