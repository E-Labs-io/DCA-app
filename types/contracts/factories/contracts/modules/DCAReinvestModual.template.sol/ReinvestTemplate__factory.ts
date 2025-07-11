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
  ReinvestTemplate,
  ReinvestTemplateInterface,
} from "../../../../contracts/modules/DCAReinvestModual.template.sol/ReinvestTemplate";

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
  "0x61015361003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100405760003560e01c80639b865b4314610045578063ed2f21f514610097575b600080fd5b6100816040518060400160405280601081526020017f5265696e7665737454656d706c6174650000000000000000000000000000000081525081565b60405161008e91906100b1565b60405180910390f35b61009f600081565b60405160ff909116815260200161008e565b600060208083528351808285015260005b818110156100de578581018301518582016040015282016100c2565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f830116850101925050509291505056fea26469706673582212205bf0b0b7aebfc995d322269f64ddb2f1a8e7b2154d66638fa81c872e1deae8ee64736f6c63430008140033";

type ReinvestTemplateConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReinvestTemplateConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ReinvestTemplate__factory extends ContractFactory {
  constructor(...args: ReinvestTemplateConstructorParams) {
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
      ReinvestTemplate & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ReinvestTemplate__factory {
    return super.connect(runner) as ReinvestTemplate__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReinvestTemplateInterface {
    return new Interface(_abi) as ReinvestTemplateInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ReinvestTemplate {
    return new Contract(address, _abi, runner) as unknown as ReinvestTemplate;
  }
}
