export type AddressLike = `0x${string}`;
export type BytesLike = `0x${string}`;
export type BigNumberish = number | bigint;

export type StrategyStruct = {
  accountAddress: AddressLike;
  baseToken: TokenDataStruct;
  targetToken: TokenDataStruct;
  interval: BigNumberish;
  amount: BigNumberish;
  strategyId: BigNumberish;
  active: boolean;
  reinvest: ReinvestStruct;
};

export type TokenDataStruct = {
  tokenAddress: AddressLike;
  decimals: BigNumberish;
  ticker: string;
};

export type ReinvestStruct = {
  reinvestData: BytesLike;
  active: boolean;
  investCode: BigNumberish;
  dcaAccountAddress: AddressLike;
};