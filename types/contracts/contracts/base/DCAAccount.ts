/**
 * Autogenerated file. Do not edit manually.
 *
 * @format
 */

/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export declare namespace IDCADataStructures {
  export type TokenDataStruct = {
    tokenAddress: AddressLike;
    decimals: BigNumberish;
    ticker: string;
  };

  export type TokenDataStructOutput = [
    tokenAddress: string,
    decimals: bigint,
    ticker: string
  ] & { tokenAddress: string; decimals: bigint; ticker: string };

  export type ReinvestStruct = {
    reinvestData: BytesLike;
    active: boolean;
    investCode: BigNumberish;
    dcaAccountAddress: AddressLike;
  };

  export type ReinvestStructOutput = [
    reinvestData: string,
    active: boolean,
    investCode: bigint,
    dcaAccountAddress: string
  ] & {
    reinvestData: string;
    active: boolean;
    investCode: bigint;
    dcaAccountAddress: string;
  };

  export type StrategyStruct = {
    accountAddress: AddressLike;
    baseToken: IDCADataStructures.TokenDataStruct;
    targetToken: IDCADataStructures.TokenDataStruct;
    interval: BigNumberish;
    amount: BigNumberish;
    strategyId: BigNumberish;
    active: boolean;
    reinvest: IDCADataStructures.ReinvestStruct;
  };

  export type StrategyStructOutput = [
    accountAddress: string,
    baseToken: IDCADataStructures.TokenDataStructOutput,
    targetToken: IDCADataStructures.TokenDataStructOutput,
    interval: bigint,
    amount: bigint,
    strategyId: bigint,
    active: boolean,
    reinvest: IDCADataStructures.ReinvestStructOutput
  ] & {
    accountAddress: string;
    baseToken: IDCADataStructures.TokenDataStructOutput;
    targetToken: IDCADataStructures.TokenDataStructOutput;
    interval: bigint;
    amount: bigint;
    strategyId: bigint;
    active: boolean;
    reinvest: IDCADataStructures.ReinvestStructOutput;
  };
}

export interface DCAAccountInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "Execute"
      | "ExecutorDeactivate"
      | "FundAccount"
      | "SWAP_ROUTER"
      | "SetupStrategy"
      | "SubscribeStrategy"
      | "UnFundAccount"
      | "UnWindReinvest"
      | "UnsubscribeStrategy"
      | "WithdrawSavings"
      | "changeExecutor"
      | "changeReinvestLibrary"
      | "getAttachedReinvestLibraryAddress"
      | "getAttachedReinvestLibraryVersion"
      | "getBaseBalance"
      | "getExecutorAddress"
      | "getStrategyData"
      | "getTargetBalance"
      | "getTimeTillWindow"
      | "owner"
      | "removeExecutor"
      | "renounceOwnership"
      | "setStrategyReinvest"
      | "transferOwnership"
      | "updateSwapAddress"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "ExecutorAddressChange"
      | "OwnershipTransferred"
      | "ReinvestExecuted"
      | "ReinvestLibraryChanged"
      | "ReinvestUnwound"
      | "StrategyCreated"
      | "StrategyExecuted"
      | "StrategySubscribed"
      | "StrategyUnsubscribed"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "Execute",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "ExecutorDeactivate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "FundAccount",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "SWAP_ROUTER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "SetupStrategy",
    values: [IDCADataStructures.StrategyStruct, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "SubscribeStrategy",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "UnFundAccount",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "UnWindReinvest",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "UnsubscribeStrategy",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "WithdrawSavings",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "changeExecutor",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "changeReinvestLibrary",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getAttachedReinvestLibraryAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAttachedReinvestLibraryVersion",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBaseBalance",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getExecutorAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getStrategyData",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTargetBalance",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getTimeTillWindow",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeExecutor",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setStrategyReinvest",
    values: [BigNumberish, IDCADataStructures.ReinvestStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "updateSwapAddress",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "Execute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ExecutorDeactivate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "FundAccount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "SWAP_ROUTER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "SetupStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "SubscribeStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "UnFundAccount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "UnWindReinvest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "UnsubscribeStrategy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "WithdrawSavings",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeReinvestLibrary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttachedReinvestLibraryAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAttachedReinvestLibraryVersion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBaseBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExecutorAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getStrategyData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTargetBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTimeTillWindow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setStrategyReinvest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateSwapAddress",
    data: BytesLike
  ): Result;
}

export namespace ExecutorAddressChangeEvent {
  export type InputTuple = [newAddress_: AddressLike];
  export type OutputTuple = [newAddress_: string];
  export interface OutputObject {
    newAddress_: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ReinvestExecutedEvent {
  export type InputTuple = [
    strategyId_: BigNumberish,
    success: boolean,
    amountReturned: BigNumberish
  ];
  export type OutputTuple = [
    strategyId_: bigint,
    success: boolean,
    amountReturned: bigint
  ];
  export interface OutputObject {
    strategyId_: bigint;
    success: boolean;
    amountReturned: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ReinvestLibraryChangedEvent {
  export type InputTuple = [newLibraryAddress: AddressLike];
  export type OutputTuple = [newLibraryAddress: string];
  export interface OutputObject {
    newLibraryAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ReinvestUnwoundEvent {
  export type InputTuple = [
    strategyId: BigNumberish,
    amount: BigNumberish,
    success: boolean
  ];
  export type OutputTuple = [
    strategyId: bigint,
    amount: bigint,
    success: boolean
  ];
  export interface OutputObject {
    strategyId: bigint;
    amount: bigint;
    success: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyCreatedEvent {
  export type InputTuple = [strategyId_: BigNumberish];
  export type OutputTuple = [strategyId_: bigint];
  export interface OutputObject {
    strategyId_: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyExecutedEvent {
  export type InputTuple = [
    strategyId_: BigNumberish,
    amountIn_: BigNumberish,
    reInvested_: boolean
  ];
  export type OutputTuple = [
    strategyId_: bigint,
    amountIn_: bigint,
    reInvested_: boolean
  ];
  export interface OutputObject {
    strategyId_: bigint;
    amountIn_: bigint;
    reInvested_: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategySubscribedEvent {
  export type InputTuple = [strategyId_: BigNumberish, executor_: AddressLike];
  export type OutputTuple = [strategyId_: bigint, executor_: string];
  export interface OutputObject {
    strategyId_: bigint;
    executor_: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyUnsubscribedEvent {
  export type InputTuple = [strategyId_: BigNumberish];
  export type OutputTuple = [strategyId_: bigint];
  export interface OutputObject {
    strategyId_: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface DCAAccount extends BaseContract {
  connect(runner?: ContractRunner | null): DCAAccount;
  waitForDeployment(): Promise<this>;

  interface: DCAAccountInterface;

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

  Execute: TypedContractMethod<
    [strategyId_: BigNumberish, feeAmount_: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  ExecutorDeactivate: TypedContractMethod<
    [strategyId_: BigNumberish],
    [void],
    "nonpayable"
  >;

  FundAccount: TypedContractMethod<
    [token_: AddressLike, amount_: BigNumberish],
    [void],
    "nonpayable"
  >;

  SWAP_ROUTER: TypedContractMethod<[], [string], "view">;

  SetupStrategy: TypedContractMethod<
    [
      newStrategy_: IDCADataStructures.StrategyStruct,
      seedFunds_: BigNumberish,
      subscribeToExecutor_: boolean
    ],
    [void],
    "nonpayable"
  >;

  SubscribeStrategy: TypedContractMethod<
    [strategyId_: BigNumberish],
    [void],
    "nonpayable"
  >;

  UnFundAccount: TypedContractMethod<
    [token_: AddressLike, amount_: BigNumberish],
    [void],
    "nonpayable"
  >;

  UnWindReinvest: TypedContractMethod<
    [strategyId_: BigNumberish],
    [void],
    "nonpayable"
  >;

  UnsubscribeStrategy: TypedContractMethod<
    [strategyId_: BigNumberish],
    [void],
    "nonpayable"
  >;

  WithdrawSavings: TypedContractMethod<
    [token_: AddressLike, amount_: BigNumberish],
    [void],
    "nonpayable"
  >;

  changeExecutor: TypedContractMethod<
    [executorAddress_: AddressLike],
    [void],
    "nonpayable"
  >;

  changeReinvestLibrary: TypedContractMethod<
    [newLibraryAddress_: AddressLike],
    [void],
    "nonpayable"
  >;

  getAttachedReinvestLibraryAddress: TypedContractMethod<[], [string], "view">;

  getAttachedReinvestLibraryVersion: TypedContractMethod<[], [string], "view">;

  getBaseBalance: TypedContractMethod<[token_: AddressLike], [bigint], "view">;

  getExecutorAddress: TypedContractMethod<[], [string], "view">;

  getStrategyData: TypedContractMethod<
    [strategyId_: BigNumberish],
    [IDCADataStructures.StrategyStructOutput],
    "view"
  >;

  getTargetBalance: TypedContractMethod<
    [token_: AddressLike],
    [bigint],
    "view"
  >;

  getTimeTillWindow: TypedContractMethod<
    [strategyId_: BigNumberish],
    [
      [bigint, bigint, boolean] & {
        lastEx: bigint;
        secondsLeft: bigint;
        checkReturn: boolean;
      }
    ],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  removeExecutor: TypedContractMethod<[], [void], "nonpayable">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setStrategyReinvest: TypedContractMethod<
    [strategyId_: BigNumberish, reinvest_: IDCADataStructures.ReinvestStruct],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  updateSwapAddress: TypedContractMethod<
    [swapRouter_: AddressLike],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "Execute"
  ): TypedContractMethod<
    [strategyId_: BigNumberish, feeAmount_: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "ExecutorDeactivate"
  ): TypedContractMethod<[strategyId_: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "FundAccount"
  ): TypedContractMethod<
    [token_: AddressLike, amount_: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "SWAP_ROUTER"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "SetupStrategy"
  ): TypedContractMethod<
    [
      newStrategy_: IDCADataStructures.StrategyStruct,
      seedFunds_: BigNumberish,
      subscribeToExecutor_: boolean
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "SubscribeStrategy"
  ): TypedContractMethod<[strategyId_: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "UnFundAccount"
  ): TypedContractMethod<
    [token_: AddressLike, amount_: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "UnWindReinvest"
  ): TypedContractMethod<[strategyId_: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "UnsubscribeStrategy"
  ): TypedContractMethod<[strategyId_: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "WithdrawSavings"
  ): TypedContractMethod<
    [token_: AddressLike, amount_: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "changeExecutor"
  ): TypedContractMethod<[executorAddress_: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "changeReinvestLibrary"
  ): TypedContractMethod<
    [newLibraryAddress_: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getAttachedReinvestLibraryAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getAttachedReinvestLibraryVersion"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getBaseBalance"
  ): TypedContractMethod<[token_: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getExecutorAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getStrategyData"
  ): TypedContractMethod<
    [strategyId_: BigNumberish],
    [IDCADataStructures.StrategyStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTargetBalance"
  ): TypedContractMethod<[token_: AddressLike], [bigint], "view">;
  getFunction(nameOrSignature: "getTimeTillWindow"): TypedContractMethod<
    [strategyId_: BigNumberish],
    [
      [bigint, bigint, boolean] & {
        lastEx: bigint;
        secondsLeft: bigint;
        checkReturn: boolean;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "removeExecutor"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setStrategyReinvest"
  ): TypedContractMethod<
    [strategyId_: BigNumberish, reinvest_: IDCADataStructures.ReinvestStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "updateSwapAddress"
  ): TypedContractMethod<[swapRouter_: AddressLike], [void], "nonpayable">;

  getEvent(
    key: "ExecutorAddressChange"
  ): TypedContractEvent<
    ExecutorAddressChangeEvent.InputTuple,
    ExecutorAddressChangeEvent.OutputTuple,
    ExecutorAddressChangeEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "ReinvestExecuted"
  ): TypedContractEvent<
    ReinvestExecutedEvent.InputTuple,
    ReinvestExecutedEvent.OutputTuple,
    ReinvestExecutedEvent.OutputObject
  >;
  getEvent(
    key: "ReinvestLibraryChanged"
  ): TypedContractEvent<
    ReinvestLibraryChangedEvent.InputTuple,
    ReinvestLibraryChangedEvent.OutputTuple,
    ReinvestLibraryChangedEvent.OutputObject
  >;
  getEvent(
    key: "ReinvestUnwound"
  ): TypedContractEvent<
    ReinvestUnwoundEvent.InputTuple,
    ReinvestUnwoundEvent.OutputTuple,
    ReinvestUnwoundEvent.OutputObject
  >;
  getEvent(
    key: "StrategyCreated"
  ): TypedContractEvent<
    StrategyCreatedEvent.InputTuple,
    StrategyCreatedEvent.OutputTuple,
    StrategyCreatedEvent.OutputObject
  >;
  getEvent(
    key: "StrategyExecuted"
  ): TypedContractEvent<
    StrategyExecutedEvent.InputTuple,
    StrategyExecutedEvent.OutputTuple,
    StrategyExecutedEvent.OutputObject
  >;
  getEvent(
    key: "StrategySubscribed"
  ): TypedContractEvent<
    StrategySubscribedEvent.InputTuple,
    StrategySubscribedEvent.OutputTuple,
    StrategySubscribedEvent.OutputObject
  >;
  getEvent(
    key: "StrategyUnsubscribed"
  ): TypedContractEvent<
    StrategyUnsubscribedEvent.InputTuple,
    StrategyUnsubscribedEvent.OutputTuple,
    StrategyUnsubscribedEvent.OutputObject
  >;

  filters: {
    "ExecutorAddressChange(address)": TypedContractEvent<
      ExecutorAddressChangeEvent.InputTuple,
      ExecutorAddressChangeEvent.OutputTuple,
      ExecutorAddressChangeEvent.OutputObject
    >;
    ExecutorAddressChange: TypedContractEvent<
      ExecutorAddressChangeEvent.InputTuple,
      ExecutorAddressChangeEvent.OutputTuple,
      ExecutorAddressChangeEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "ReinvestExecuted(uint256,bool,uint256)": TypedContractEvent<
      ReinvestExecutedEvent.InputTuple,
      ReinvestExecutedEvent.OutputTuple,
      ReinvestExecutedEvent.OutputObject
    >;
    ReinvestExecuted: TypedContractEvent<
      ReinvestExecutedEvent.InputTuple,
      ReinvestExecutedEvent.OutputTuple,
      ReinvestExecutedEvent.OutputObject
    >;

    "ReinvestLibraryChanged(address)": TypedContractEvent<
      ReinvestLibraryChangedEvent.InputTuple,
      ReinvestLibraryChangedEvent.OutputTuple,
      ReinvestLibraryChangedEvent.OutputObject
    >;
    ReinvestLibraryChanged: TypedContractEvent<
      ReinvestLibraryChangedEvent.InputTuple,
      ReinvestLibraryChangedEvent.OutputTuple,
      ReinvestLibraryChangedEvent.OutputObject
    >;

    "ReinvestUnwound(uint256,uint256,bool)": TypedContractEvent<
      ReinvestUnwoundEvent.InputTuple,
      ReinvestUnwoundEvent.OutputTuple,
      ReinvestUnwoundEvent.OutputObject
    >;
    ReinvestUnwound: TypedContractEvent<
      ReinvestUnwoundEvent.InputTuple,
      ReinvestUnwoundEvent.OutputTuple,
      ReinvestUnwoundEvent.OutputObject
    >;

    "StrategyCreated(uint256)": TypedContractEvent<
      StrategyCreatedEvent.InputTuple,
      StrategyCreatedEvent.OutputTuple,
      StrategyCreatedEvent.OutputObject
    >;
    StrategyCreated: TypedContractEvent<
      StrategyCreatedEvent.InputTuple,
      StrategyCreatedEvent.OutputTuple,
      StrategyCreatedEvent.OutputObject
    >;

    "StrategyExecuted(uint256,uint256,bool)": TypedContractEvent<
      StrategyExecutedEvent.InputTuple,
      StrategyExecutedEvent.OutputTuple,
      StrategyExecutedEvent.OutputObject
    >;
    StrategyExecuted: TypedContractEvent<
      StrategyExecutedEvent.InputTuple,
      StrategyExecutedEvent.OutputTuple,
      StrategyExecutedEvent.OutputObject
    >;

    "StrategySubscribed(uint256,address)": TypedContractEvent<
      StrategySubscribedEvent.InputTuple,
      StrategySubscribedEvent.OutputTuple,
      StrategySubscribedEvent.OutputObject
    >;
    StrategySubscribed: TypedContractEvent<
      StrategySubscribedEvent.InputTuple,
      StrategySubscribedEvent.OutputTuple,
      StrategySubscribedEvent.OutputObject
    >;

    "StrategyUnsubscribed(uint256)": TypedContractEvent<
      StrategyUnsubscribedEvent.InputTuple,
      StrategyUnsubscribedEvent.OutputTuple,
      StrategyUnsubscribedEvent.OutputObject
    >;
    StrategyUnsubscribed: TypedContractEvent<
      StrategyUnsubscribedEvent.InputTuple,
      StrategyUnsubscribedEvent.OutputTuple,
      StrategyUnsubscribedEvent.OutputObject
    >;
  };
}
