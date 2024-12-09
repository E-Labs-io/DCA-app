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
  DCAReinvest,
  DCAReinvestInterface,
} from "../../../contracts/base/DCAReinvest";

const _abi = [
  {
    inputs: [
      {
        internalType: "bool",
        name: "activeLibrary_",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ContractIsPaused",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bool",
        name: "active_",
        type: "bool",
      },
    ],
    name: "ContractActiveStateChange",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "ACTIVE_REINVESTS",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REINVEST_VERSION",
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
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "reinvestData",
            type: "bytes",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "investCode",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "dcaAccountAddress",
            type: "address",
          },
        ],
        internalType: "struct IDCADataStructures.Reinvest",
        name: "reinvestData_",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "executeReinvest",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveModuals",
    outputs: [
      {
        internalType: "uint8[]",
        name: "",
        type: "uint8[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLibraryVersion",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "code_",
        type: "uint8",
      },
    ],
    name: "getModuleName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "isActive",
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
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "setActiveState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "reinvestData",
            type: "bytes",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "investCode",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "dcaAccountAddress",
            type: "address",
          },
        ],
        internalType: "struct IDCADataStructures.Reinvest",
        name: "reinvestData_",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "unwindReinvest",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040526000805460ff1916600117905534801561001d57600080fd5b5060405161129f38038061129f83398101604081905261003c9161010f565b338061006257604051631e4fbdf760e01b81526000600482015260240160405180910390fd5b61006b8161007b565b50610075816100d4565b50610138565b600080546001600160a01b03838116610100818102610100600160a81b0319851617855560405193049190911692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a35050565b6000805460ff1916821515908117825560405190917fbdf1a3ee1d5eb15aa60ae1a81488107759732ead44999c8c807575100def058b91a250565b60006020828403121561012157600080fd5b8151801515811461013157600080fd5b9392505050565b611158806101476000396000f3fe608060405234801561001057600080fd5b50600436106100d45760003560e01c80638da5cb5b11610081578063c7b785e81161005b578063c7b785e81461021b578063c9f6d48f1461022e578063f2fde38b1461029557600080fd5b80638da5cb5b146101b0578063bcb9236e146101f3578063c445d2ea1461020657600080fd5b8063454f002a116100b2578063454f002a14610144578063715018a61461016c578063738800b71461017457600080fd5b80630ca75044146100d957806322f3e2d41461012457806340438aea1461013a575b600080fd5b60408051808201909152600981527f544553542056302e35000000000000000000000000000000000000000000000060208201525b60405161011b9190610cb4565b60405180910390f35b60005460ff16604051901515815260200161011b565b6101426102ad565b005b610157610152366004610dd5565b6102cc565b6040805192835290151560208301520161011b565b610142610321565b61010e6040518060400160405280600981526020017f544553542056302e35000000000000000000000000000000000000000000000081525081565b600054610100900473ffffffffffffffffffffffffffffffffffffffff1660405173ffffffffffffffffffffffffffffffffffffffff909116815260200161011b565b610157610201366004610dd5565b610333565b61020e610340565b60405161011b9190610eeb565b61010e610229366004610f32565b6103b7565b61010e6040517f010000000000000000000000000000000000000000000000000000000000000060208201527f1200000000000000000000000000000000000000000000000000000000000000602182015260220160405160208183030381529060405281565b6101426102a3366004610f4f565b6103cb565b905090565b6102b5610434565b6102ca6102c460005460ff1690565b1561048d565b565b60008054819060ff1661030b576040517f6d39fcd000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61031584846104e6565b915091505b9250929050565b610329610434565b6102ca600061056c565b60008061031584846105e9565b6040517f010000000000000000000000000000000000000000000000000000000000000060208201527f120000000000000000000000000000000000000000000000000000000000000060218201526060906022016040516020818303038152906040528060200190518101906102a89190610f6c565b60606103c58260ff16610628565b92915050565b6103d3610434565b73ffffffffffffffffffffffffffffffffffffffff8116610428576040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600060048201526024015b60405180910390fd5b6104318161056c565b50565b60005473ffffffffffffffffffffffffffffffffffffffff6101009091041633146102ca576040517f118cdaa700000000000000000000000000000000000000000000000000000000815233600482015260240161041f565b600080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016821515908117825560405190917fbdf1a3ee1d5eb15aa60ae1a81488107759732ead44999c8c807575100def058b91a250565b6040820151600090819060ff81166104fe575061031a565b600160ff82160361052157610517848660000151610739565b925092505061031a565b601160ff821614610564577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffee60ff82160161056457610517848660000151610883565b509250929050565b6000805473ffffffffffffffffffffffffffffffffffffffff8381166101008181027fffffffffffffffffffffff0000000000000000000000000000000000000000ff851617855560405193049190911692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a35050565b600080601160ff16846040015160ff16111561031a57601260ff16846040015160ff160361031a5761061f838560000151610b4c565b9150915061031a565b606060ff821661066b57505060408051808201909152600a81527f4e6f742041637469766500000000000000000000000000000000000000000000602082015290565b60ff82166001036106af57505060408051808201909152601581527f466f7277617264205265696e766573742056302e320000000000000000000000602082015290565b60ff82166012036106f357505060408051808201909152601081527f41617665205633205265696e7665737400000000000000000000000000000000602082015290565b60ff8216601503610734575060408051808201909152601081527f41617665205633205265696e766573740000000000000000000000000000000060208201525b919050565b600080600061074784610c21565b604081015190915073ffffffffffffffffffffffffffffffffffffffff166107d557806020015173ffffffffffffffffffffffffffffffffffffffff168560405160006040518083038185875af1925050503d80600081146107c5576040519150601f19603f3d011682016040523d82523d6000602084013e6107ca565b606091505b50508092505061087b565b604080820151602083015191517fa9059cbb00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff92831660048201526024810188905291169063a9059cbb906044016020604051808303816000875af1158015610854573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610878919061101e565b91505b509293915050565b600080600061089184610c21565b60408082015190517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015291925060009173ffffffffffffffffffffffffffffffffffffffff909116906370a0823190602401602060405180830381865afa158015610907573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061092b919061103b565b60208301516040517f095ea7b300000000000000000000000000000000000000000000000000000000815273a238dd80c259a72e81d7e4664a9801593f98d1c560048201526024810189905291925060009173ffffffffffffffffffffffffffffffffffffffff9091169063095ea7b3906044016020604051808303816000875af11580156109be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109e2919061101e565b90508015610b425760208301516040517f617ba03700000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff9091166004820152602481018890523060448201526000606482015273a238dd80c259a72e81d7e4664a9801593f98d1c59063617ba03790608401600060405180830381600087803b158015610a7f57600080fd5b505af1158015610a93573d6000803e3d6000fd5b5050505060408381015190517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015260009173ffffffffffffffffffffffffffffffffffffffff16906370a0823190602401602060405180830381865afa158015610b08573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2c919061103b565b9050610b388382611054565b9550600086119450505b5050509250929050565b6000806000610b5a84610c21565b60208101516040517f69328dec00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff90911660048201526024810187905230604482015290915073a238dd80c259a72e81d7e4664a9801593f98d1c5906369328dec906064016020604051808303816000875af1158015610bf0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c14919061103b565b9586151595509350505050565b604080516060810182526000808252602080830182905292820152825190916103c59184018101908401611106565b6000815180845260005b81811015610c7657602081850181015186830182015201610c5a565b5060006020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b602081526000610cc76020830184610c50565b9392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040516080810167ffffffffffffffff81118282101715610d2057610d20610cce565b60405290565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff81118282101715610d6d57610d6d610cce565b604052919050565b801515811461043157600080fd5b803561073481610d75565b60ff8116811461043157600080fd5b803561073481610d8e565b73ffffffffffffffffffffffffffffffffffffffff8116811461043157600080fd5b803561073481610da8565b60008060408385031215610de857600080fd5b823567ffffffffffffffff80821115610e0057600080fd5b9084019060808287031215610e1457600080fd5b610e1c610cfd565b823582811115610e2b57600080fd5b8301601f81018813610e3c57600080fd5b8035602084821115610e5057610e50610cce565b610e80817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f85011601610d26565b94508185528981838501011115610e9657600080fd5b81818401828701376000818387010152848452610eb4818701610d83565b81850152610ec460408701610d9d565b6040850152610ed560608701610dca565b6060850152929997909201359750505050505050565b6020808252825182820181905260009190848201906040850190845b81811015610f2657835160ff1683529284019291840191600101610f07565b50909695505050505050565b600060208284031215610f4457600080fd5b8135610cc781610d8e565b600060208284031215610f6157600080fd5b8135610cc781610da8565b60006020808385031215610f7f57600080fd5b825167ffffffffffffffff80821115610f9757600080fd5b818501915085601f830112610fab57600080fd5b815181811115610fbd57610fbd610cce565b8060051b9150610fce848301610d26565b8181529183018401918481019088841115610fe857600080fd5b938501935b83851015611012578451925061100283610d8e565b8282529385019390850190610fed565b98975050505050505050565b60006020828403121561103057600080fd5b8151610cc781610d75565b60006020828403121561104d57600080fd5b5051919050565b818103818111156103c5577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000606082840312156110a057600080fd5b6040516060810181811067ffffffffffffffff821117156110c3576110c3610cce565b806040525080915082516110d681610d8e565b815260208301516110e681610da8565b602082015260408301516110f981610da8565b6040919091015292915050565b60006060828403121561111857600080fd5b610cc7838361108e56fea26469706673582212204c5bd42acea8fc34475fb67d35d057deb161b36a2328c67055f511f35eccdc0164736f6c63430008140033";

type DCAReinvestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DCAReinvestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DCAReinvest__factory extends ContractFactory {
  constructor(...args: DCAReinvestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    activeLibrary_: boolean,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(activeLibrary_, overrides || {});
  }
  override deploy(
    activeLibrary_: boolean,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(activeLibrary_, overrides || {}) as Promise<
      DCAReinvest & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): DCAReinvest__factory {
    return super.connect(runner) as DCAReinvest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DCAReinvestInterface {
    return new Interface(_abi) as DCAReinvestInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): DCAReinvest {
    return new Contract(address, _abi, runner) as unknown as DCAReinvest;
  }
}
