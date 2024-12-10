/** @format */

import {
  type DCAAccount,
  type IDCADataStructures,
  type StrategyCreatedEvent,
  type StrategyExecutedEvent,
} from "@/types/contracts/contracts/base/DCAAccount";
import {
  type AccountStrategyExecutionEvent,
  type StrategyCreationEvent,
} from "@/types/eventTransactions";
import { type AccountCreatedEvent as DCAAccountCreatedEvent } from "@/types/contracts/contracts/base/DCAFactory";
import { type AccountCreatedEvent } from "@/types/eventTransactions";

export const buildStrategyCreationEvent = (
  event: StrategyCreatedEvent.Log,
  contract: DCAAccount
): StrategyCreationEvent => {
  return {
    id: Number(event.args.strategyId_).toString(),
    account: event.address,
    blockNumber: Number(event.blockNumber),
    transactionHash: event.transactionHash,
    accountContract: contract,
  };
};

export const buildAccountStrategyExecutionEvent = (
  event: StrategyExecutedEvent.Log
): AccountStrategyExecutionEvent => {
  return {
    id: Number(event.args.strategyId_).toString(),
    amountIn: Number(event.args.amountIn_).toString(),
    reinestActive: event.args.reInvested_,
    blockNumber: Number(event.blockNumber),
    transactionHash: event.transactionHash,
  };
};

export const buildAccountCreatedEvent = (
  event: DCAAccountCreatedEvent.Log,
  contract: DCAAccount
): AccountCreatedEvent => {
  return {
    accountContract: contract,
    owner: event.args.owner,
    dcaAccount: event.args.dcaAccount,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  };
};

export const buildStrategyStruct = (
  data: IDCADataStructures.StrategyStructOutput
): IDCADataStructures.StrategyStruct => {
  return {
    strategyId: Number(data.strategyId).toString(),
    accountAddress: data.accountAddress,
    baseToken: {
      tokenAddress: data.baseToken[0],
      decimals: data.baseToken[1],
      ticker: data.baseToken[2],
    },
    targetToken: {
      tokenAddress: data.targetToken[0],
      decimals: data.targetToken[1],
      ticker: data.targetToken[2],
    },
    interval: data.interval,
    amount: Number(data.amount).toString(),
    reinvest: data.reinvest,
    active: data.active,
  };
};
