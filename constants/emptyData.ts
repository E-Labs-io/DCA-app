/** @format */

import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const EMPTY_TOKEN_DATA = [ZERO_ADDRESS, 0, "0x00"];
export const EMPTY_TEMPLATE_REINVEST_MODUAL = [
  0x00,
  ZERO_ADDRESS,
  ZERO_ADDRESS,
];
export const EMPTY_REINVEST = ["0x", false, 0, ZERO_ADDRESS];
export const EMPTY_STRATEGY = [
  ZERO_ADDRESS,
  EMPTY_TOKEN_DATA,
  EMPTY_TOKEN_DATA,
  0,
  0,
  0,
  false,
  EMPTY_REINVEST,
];

export const EMPTY_TOKEN_DATA_OBJECT: IDCADataStructures.TokenDataStruct = {
  tokenAddress: EMPTY_TOKEN_DATA[0] as string,
  decimals: 0,
  ticker: "0x00",
};
export const EMPTY_REINVEST_OBJECT: IDCADataStructures.ReinvestStruct = {
  reinvestData: "0x",
  active: false,
  investCode: 0,
  dcaAccountAddress: ZERO_ADDRESS,
};

export const EMPTY_STRATEGY_OBJECT: IDCADataStructures.StrategyStruct = {
  accountAddress: ZERO_ADDRESS,
  baseToken: EMPTY_TOKEN_DATA_OBJECT,
  targetToken: EMPTY_TOKEN_DATA_OBJECT,
  interval: 0,
  amount: 0,
  strategyId: 0,
  active: false,
  reinvest: EMPTY_REINVEST_OBJECT,
};
