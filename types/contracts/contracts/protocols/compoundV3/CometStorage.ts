/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
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
} from "../../../common";

export interface CometStorageInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "isAllowed"
      | "liquidatorPoints"
      | "totalsCollateral"
      | "userBasic"
      | "userCollateral"
      | "userNonce"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "isAllowed",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "liquidatorPoints",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "totalsCollateral",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "userBasic",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "userCollateral",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "userNonce",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "isAllowed", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "liquidatorPoints",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalsCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "userBasic", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "userCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "userNonce", data: BytesLike): Result;
}

export interface CometStorage extends BaseContract {
  connect(runner?: ContractRunner | null): CometStorage;
  waitForDeployment(): Promise<this>;

  interface: CometStorageInterface;

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

  isAllowed: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [boolean],
    "view"
  >;

  liquidatorPoints: TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, bigint, bigint] & {
        numAbsorbs: bigint;
        numAbsorbed: bigint;
        approxSpend: bigint;
        _reserved: bigint;
      }
    ],
    "view"
  >;

  totalsCollateral: TypedContractMethod<
    [arg0: AddressLike],
    [[bigint, bigint] & { totalSupplyAsset: bigint; _reserved: bigint }],
    "view"
  >;

  userBasic: TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, bigint, bigint, bigint] & {
        principal: bigint;
        baseTrackingIndex: bigint;
        baseTrackingAccrued: bigint;
        assetsIn: bigint;
        _reserved: bigint;
      }
    ],
    "view"
  >;

  userCollateral: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [[bigint, bigint] & { balance: bigint; _reserved: bigint }],
    "view"
  >;

  userNonce: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "isAllowed"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "liquidatorPoints"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, bigint, bigint] & {
        numAbsorbs: bigint;
        numAbsorbed: bigint;
        approxSpend: bigint;
        _reserved: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "totalsCollateral"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [[bigint, bigint] & { totalSupplyAsset: bigint; _reserved: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "userBasic"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [bigint, bigint, bigint, bigint, bigint] & {
        principal: bigint;
        baseTrackingIndex: bigint;
        baseTrackingAccrued: bigint;
        assetsIn: bigint;
        _reserved: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "userCollateral"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [[bigint, bigint] & { balance: bigint; _reserved: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "userNonce"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  filters: {};
}
