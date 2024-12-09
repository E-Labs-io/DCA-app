/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../../../common";

export declare namespace ISwapRouter02 {
  export type ExactInputParamsStruct = {
    path: BytesLike;
    recipient: AddressLike;
    amountIn: BigNumberish;
    amountOutMinimum: BigNumberish;
  };

  export type ExactInputParamsStructOutput = [
    path: string,
    recipient: string,
    amountIn: bigint,
    amountOutMinimum: bigint
  ] & {
    path: string;
    recipient: string;
    amountIn: bigint;
    amountOutMinimum: bigint;
  };

  export type ExactInputSingleParamsStruct = {
    tokenIn: AddressLike;
    tokenOut: AddressLike;
    fee: BigNumberish;
    recipient: AddressLike;
    amountIn: BigNumberish;
    amountOutMinimum: BigNumberish;
    sqrtPriceLimitX96: BigNumberish;
  };

  export type ExactInputSingleParamsStructOutput = [
    tokenIn: string,
    tokenOut: string,
    fee: bigint,
    recipient: string,
    amountIn: bigint,
    amountOutMinimum: bigint,
    sqrtPriceLimitX96: bigint
  ] & {
    tokenIn: string;
    tokenOut: string;
    fee: bigint;
    recipient: string;
    amountIn: bigint;
    amountOutMinimum: bigint;
    sqrtPriceLimitX96: bigint;
  };

  export type ExactOutputParamsStruct = {
    path: BytesLike;
    recipient: AddressLike;
    amountOut: BigNumberish;
    amountInMaximum: BigNumberish;
  };

  export type ExactOutputParamsStructOutput = [
    path: string,
    recipient: string,
    amountOut: bigint,
    amountInMaximum: bigint
  ] & {
    path: string;
    recipient: string;
    amountOut: bigint;
    amountInMaximum: bigint;
  };

  export type ExactOutputSingleParamsStruct = {
    tokenIn: AddressLike;
    tokenOut: AddressLike;
    fee: BigNumberish;
    recipient: AddressLike;
    amountOut: BigNumberish;
    amountInMaximum: BigNumberish;
    sqrtPriceLimitX96: BigNumberish;
  };

  export type ExactOutputSingleParamsStructOutput = [
    tokenIn: string,
    tokenOut: string,
    fee: bigint,
    recipient: string,
    amountOut: bigint,
    amountInMaximum: bigint,
    sqrtPriceLimitX96: bigint
  ] & {
    tokenIn: string;
    tokenOut: string;
    fee: bigint;
    recipient: string;
    amountOut: bigint;
    amountInMaximum: bigint;
    sqrtPriceLimitX96: bigint;
  };
}

export interface ISwapRouter02Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "WETH9"
      | "exactInput"
      | "exactInputSingle"
      | "exactOutput"
      | "exactOutputSingle"
      | "swapExactTokensForETH"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "WETH9", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "exactInput",
    values: [ISwapRouter02.ExactInputParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "exactInputSingle",
    values: [ISwapRouter02.ExactInputSingleParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "exactOutput",
    values: [ISwapRouter02.ExactOutputParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "exactOutputSingle",
    values: [ISwapRouter02.ExactOutputSingleParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "swapExactTokensForETH",
    values: [
      BigNumberish,
      BigNumberish,
      AddressLike[],
      AddressLike,
      BigNumberish
    ]
  ): string;

  decodeFunctionResult(functionFragment: "WETH9", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exactInput", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "exactInputSingle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exactOutput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exactOutputSingle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapExactTokensForETH",
    data: BytesLike
  ): Result;
}

export interface ISwapRouter02 extends BaseContract {
  connect(runner?: ContractRunner | null): ISwapRouter02;
  waitForDeployment(): Promise<this>;

  interface: ISwapRouter02Interface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  WETH9: TypedContractMethod<[], [string], "view">;

  exactInput: TypedContractMethod<
    [params: ISwapRouter02.ExactInputParamsStruct],
    [bigint],
    "payable"
  >;

  exactInputSingle: TypedContractMethod<
    [params: ISwapRouter02.ExactInputSingleParamsStruct],
    [bigint],
    "payable"
  >;

  exactOutput: TypedContractMethod<
    [params: ISwapRouter02.ExactOutputParamsStruct],
    [bigint],
    "payable"
  >;

  exactOutputSingle: TypedContractMethod<
    [params: ISwapRouter02.ExactOutputSingleParamsStruct],
    [bigint],
    "payable"
  >;

  swapExactTokensForETH: TypedContractMethod<
    [
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: AddressLike[],
      to: AddressLike,
      deadline: BigNumberish
    ],
    [bigint[]],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "WETH9"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "exactInput"
  ): TypedContractMethod<
    [params: ISwapRouter02.ExactInputParamsStruct],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "exactInputSingle"
  ): TypedContractMethod<
    [params: ISwapRouter02.ExactInputSingleParamsStruct],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "exactOutput"
  ): TypedContractMethod<
    [params: ISwapRouter02.ExactOutputParamsStruct],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "exactOutputSingle"
  ): TypedContractMethod<
    [params: ISwapRouter02.ExactOutputSingleParamsStruct],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "swapExactTokensForETH"
  ): TypedContractMethod<
    [
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      path: AddressLike[],
      to: AddressLike,
      deadline: BigNumberish
    ],
    [bigint[]],
    "nonpayable"
  >;

  filters: {};
}
