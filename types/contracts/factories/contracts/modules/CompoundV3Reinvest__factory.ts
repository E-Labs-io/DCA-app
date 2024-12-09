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
import type { NonPayableOverrides } from "../../../common";
import type {
  CompoundV3Reinvest,
  CompoundV3ReinvestInterface,
} from "../../../contracts/modules/CompoundV3Reinvest";

const _abi = [
  {
    inputs: [],
    name: "MODULE_ID",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MODULE_NAME",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x61015361003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100405760003560e01c80639b865b4314610045578063ed2f21f514610097575b600080fd5b6100816040518060400160405280601481526020017f436f6d706f756e64205633205265696e7665737400000000000000000000000081525081565b60405161008e91906100b1565b60405180910390f35b61009f601181565b60405160ff909116815260200161008e565b600060208083528351808285015260005b818110156100de578581018301518582016040015282016100c2565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f830116850101925050509291505056fea2646970667358221220d79c0ddd5d54f3b887984bf3a5fe023080cd050d0a2e5be48b954661bbc951c664736f6c63430008140033";

type CompoundV3ReinvestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CompoundV3ReinvestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CompoundV3Reinvest__factory extends ContractFactory {
  constructor(...args: CompoundV3ReinvestConstructorParams) {
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
      CompoundV3Reinvest & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): CompoundV3Reinvest__factory {
    return super.connect(runner) as CompoundV3Reinvest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CompoundV3ReinvestInterface {
    return new Interface(_abi) as CompoundV3ReinvestInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): CompoundV3Reinvest {
    return new Contract(address, _abi, runner) as unknown as CompoundV3Reinvest;
  }
}
