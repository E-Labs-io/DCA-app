/** @format */

import { NetworkNameToChainID } from "@/constants/avalabuleChains";
import { ChainNumbers } from "@/types";

const getNetworkKeyByChainId = (
  chainId: number
): keyof ChainNumbers | undefined => {
  const entry = Object.entries(NetworkNameToChainID).find(
    ([_, value]) => value.number === chainId
  );

  return entry ? (entry[0] as keyof ChainNumbers) : undefined;
};

export { getNetworkKeyByChainId };
