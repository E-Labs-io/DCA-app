/** @format */

import { DCAAccount } from "./contracts";

export interface StrategyCreationEvent extends EventBase {
  // Define the structure of your strategy event here
  id: string;
  account: string;
  accountContract: DCAAccount;
}

export interface AccountCreatedEvent extends EventBase {
  dcaAccount: string;
  accountContract: DCAAccount;
  owner: string;
}

export interface AccountStrategyExecutionEvent extends EventBase {
  id: string;
  amountIn: string;
  reinestActive: boolean;
}

export type EventBase = {
  blockNumber: number;
  transactionHash: string;
  timestamp?: number;
};
