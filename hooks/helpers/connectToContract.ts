/** @format */

import {
  type DCAAccount,
  DCAAccount__factory,
  type DCAExecutor,
  DCAExecutor__factory,
  type DCAFactory,
  DCAFactory__factory,
  IERC20__factory,
  IERC20,
} from "@/types/contracts";
import { erc20 } from "@/types/contracts/@openzeppelin/contracts/token";
import { ethers, Contract } from "ethers";

const connectToContract = async ({
  ContractAddress,
  ContractABI,
  providerOrSigner,
}: connectToContractInterface): Promise<Contract | false> => {
  if (!providerOrSigner || !ContractAddress) {
    console.log("Missing components");
    return false;
  }
  const activeContract = await newContract({
    ContractAddress,
    ContractABI,
    providerOrSigner,
  });
  return activeContract;
};

const newContract = async ({
  ContractAddress,
  ContractABI,
  providerOrSigner,
}: connectToContractInterface) =>
  new ethers.Contract(ContractAddress, ContractABI, providerOrSigner);

const connectToDCAAccount = async (
  contractAddress: string,
  providerOrSigner: ProviderOrSignerType
): Promise<DCAAccount> =>
  (await connectToContract({
    ContractAddress: contractAddress,
    ContractABI: DCAAccount__factory.abi,
    providerOrSigner,
  })) as unknown as DCAAccount;

const connectToDCAExecutor = async (
  contractAddress: string,
  providerOrSigner: ProviderOrSignerType
): Promise<DCAExecutor> =>
  (await connectToContract({
    ContractAddress: contractAddress,
    ContractABI: DCAExecutor__factory.abi,
    providerOrSigner,
  })) as unknown as DCAExecutor;

const connectToDCAFactory = async (
  contractAddress: string,
  providerOrSigner: ProviderOrSignerType
): Promise<DCAFactory> =>
  (await connectToContract({
    ContractAddress: contractAddress,
    ContractABI: DCAFactory__factory.abi,
    providerOrSigner,
  })) as unknown as DCAFactory;

const connectERC20 = async (
  contractAddress: string,
  providerOrSigner: ProviderOrSignerType
): Promise<IERC20> =>
  (await connectToContract({
    ContractAddress: contractAddress,
    ContractABI: IERC20__factory.abi,
    providerOrSigner,
  })) as unknown as IERC20;

export {
  connectERC20,
  connectToDCAAccount,
  connectToDCAExecutor,
  connectToDCAFactory,
};

export interface connectToContractInterface {
  ContractAddress: string;
  ContractABI: any;
  providerOrSigner: ProviderOrSignerType;
}

export interface connectToTokenContractInterface {
  ContractAddress: string;
  providerOrSigner: ProviderOrSignerType;
}

export type ProviderOrSignerType = ethers.Provider | ethers.Signer;
