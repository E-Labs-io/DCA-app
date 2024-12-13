/** @format */

import { NetworkKeys } from "@/types";

const DCAFactoryAddress: { [key in NetworkKeys]?: string } = {
  ETH_SEPOLIA: "0xe538fE1d89E4d1cd316AdC213c7503E303f45449",
  ARB_GOERLI: "",
  OPT_GOERLI: "",
};

const DCAExecutorAddress: { [key in NetworkKeys]?: string } = {
  ETH_SEPOLIA: "0x3D932bE6907ef00670B8e5aB48047C56f54e4441",
  ARB_GOERLI: "",
  OPT_GOERLI: "",
};

const DCAReinvestAddress: { [key in NetworkKeys]?: string } = {
  ETH_SEPOLIA: "0x4Ed0010E4F9F65355c0DA02C4c60415A93f40Fb2",
  ARB_GOERLI: "",
  OPT_GOERLI: "",
  MATIC_MUMBAI: "",
};

const ACTIVE_CHAIN: NetworkKeys[] = ["ETH_SEPOLIA"];

export {
  DCAExecutorAddress,
  DCAFactoryAddress,
  ACTIVE_CHAIN,
  DCAReinvestAddress,
};
