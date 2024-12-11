/** @format */

import { tokenList, TokenTickers } from "@/constants/tokens";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

export const getTokenIcon = (token: IDCADataStructures.TokenDataStruct) => {
  if (!token?.ticker) return "";
  const ticker = token.ticker as TokenTickers;
  return tokenList[ticker]?.icon ?? "";
};

export const getTokenTicker = (token: IDCADataStructures.TokenDataStruct) => {
  if (!token?.ticker) return "Unknown";
  return token.ticker;
};
