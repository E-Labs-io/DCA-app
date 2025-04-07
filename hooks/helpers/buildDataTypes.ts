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
    id: event.args.strategyId_.toString(),
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
    id: event.args.strategyId_.toString(),
    amountIn: event.args.amountIn_.toString(),
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
  data: any
): IDCADataStructures.StrategyStruct => {
  if (!data) {
    console.error("Strategy data is undefined");
    throw new Error("Strategy data is undefined");
  }

  if (data.strategyId === undefined) {
    console.error("Missing strategyId in data:", data);
    data.strategyId = "pending";
  }

  return {
    strategyId: data.strategyId.toString(),
    accountAddress: data.accountAddress,
    baseToken: {
      tokenAddress: data.baseToken[0],
      decimals: data.baseToken[1].toString(),
      ticker: data.baseToken[2],
    },
    targetToken: {
      tokenAddress: data.targetToken[0],
      decimals: data.targetToken[1].toString(),
      ticker: data.targetToken[2],
    },
    interval: data.interval.toString(),
    amount: data.amount.toString(),
    active: data.active,
    reinvest: {
      reinvestData: data.reinvest[0],
      active: data.reinvest[1],
      investCode: data.reinvest[2].toString(),
      dcaAccountAddress: data.reinvest[3],
    },
  };
};
