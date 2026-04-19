/** @format */

import { etherscanPrefix } from "@/constants/avalabuleChains";
import { NetworkKeys } from "@/types";

export interface buildNetworkScanLinkInterface {
  network: NetworkKeys;
  address?: string;
  tokenId?: number;
  block?: number;
  txHash?: string;
}

export const buildNetworkScanLink = ({
  network,
  address,
  tokenId,
  block,
  txHash,
}: buildNetworkScanLinkInterface) => {
  if (!network) network = "ETH_MAINNET";
  if (address && tokenId)
    return `${etherscanPrefix[network]}/token/${address}?a=${tokenId}`;

  if (block) return `${etherscanPrefix[network]}/block/${block}`;

  if (txHash) return `${etherscanPrefix[network]}/tx/${txHash}`;

  if (address && !tokenId)
    return `${etherscanPrefix[network]}/address/${address}`;

  return etherscanPrefix[network];
};
