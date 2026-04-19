/** @format */

import { ethers } from "ethers";

export type ContractTransactionReport = {
  tx: ethers.ContractTransactionResponse;
  hash: string;
};
