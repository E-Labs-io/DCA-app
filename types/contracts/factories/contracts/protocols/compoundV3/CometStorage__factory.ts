/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  CometStorage,
  CometStorageInterface,
} from "../../../../contracts/protocols/compoundV3/CometStorage";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAllowed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "liquidatorPoints",
    outputs: [
      {
        internalType: "uint32",
        name: "numAbsorbs",
        type: "uint32",
      },
      {
        internalType: "uint64",
        name: "numAbsorbed",
        type: "uint64",
      },
      {
        internalType: "uint128",
        name: "approxSpend",
        type: "uint128",
      },
      {
        internalType: "uint32",
        name: "_reserved",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "totalsCollateral",
    outputs: [
      {
        internalType: "uint128",
        name: "totalSupplyAsset",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "_reserved",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userBasic",
    outputs: [
      {
        internalType: "int104",
        name: "principal",
        type: "int104",
      },
      {
        internalType: "uint64",
        name: "baseTrackingIndex",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "baseTrackingAccrued",
        type: "uint64",
      },
      {
        internalType: "uint16",
        name: "assetsIn",
        type: "uint16",
      },
      {
        internalType: "uint8",
        name: "_reserved",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userCollateral",
    outputs: [
      {
        internalType: "uint128",
        name: "balance",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "_reserved",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061041d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c8063a165437911610050578063a165437914610172578063c5fa15cf146101b0578063dc4abafd1461027b57600080fd5b80632b92a07d146100775780632e04b8e7146100fa57806359e017bd14610128575b600080fd5b6100cc610085366004610392565b60066020908152600092835260408084209091529082529020546fffffffffffffffffffffffffffffffff8082169170010000000000000000000000000000000090041682565b604080516fffffffffffffffffffffffffffffffff9384168152929091166020830152015b60405180910390f35b61011a6101083660046103c5565b60046020526000908152604090205481565b6040519081526020016100f1565b6100cc6101363660046103c5565b6002602052600090815260409020546fffffffffffffffffffffffffffffffff8082169170010000000000000000000000000000000090041682565b6101a0610180366004610392565b600360209081526000928352604080842090915290825290205460ff1681565b60405190151581526020016100f1565b6102306101be3660046103c5565b60076020526000908152604090205463ffffffff8082169167ffffffffffffffff640100000000820416916fffffffffffffffffffffffffffffffff6c01000000000000000000000000830416917c010000000000000000000000000000000000000000000000000000000090041684565b6040805163ffffffff958616815267ffffffffffffffff90941660208501526fffffffffffffffffffffffffffffffff909216918301919091529190911660608201526080016100f1565b6103286102893660046103c5565b600560205260009081526040902054600c81900b9067ffffffffffffffff6d01000000000000000000000000008204811691750100000000000000000000000000000000000000000081049091169061ffff7d0100000000000000000000000000000000000000000000000000000000008204169060ff7f01000000000000000000000000000000000000000000000000000000000000009091041685565b60408051600c9690960b865267ffffffffffffffff9485166020870152929093169184019190915261ffff16606083015260ff16608082015260a0016100f1565b803573ffffffffffffffffffffffffffffffffffffffff8116811461038d57600080fd5b919050565b600080604083850312156103a557600080fd5b6103ae83610369565b91506103bc60208401610369565b90509250929050565b6000602082840312156103d757600080fd5b6103e082610369565b939250505056fea2646970667358221220f4c3b5e1be5725c5757d49c45e3fcff66f866604ffb626ca09208e71246dc1ff64736f6c63430008140033";

type CometStorageConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CometStorageConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CometStorage__factory extends ContractFactory {
  constructor(...args: CometStorageConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      CometStorage & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): CometStorage__factory {
    return super.connect(runner) as CometStorage__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CometStorageInterface {
    return new Interface(_abi) as CometStorageInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): CometStorage {
    return new Contract(address, _abi, runner) as unknown as CometStorage;
  }
}
