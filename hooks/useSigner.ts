/** @format */

import { getNetworkKeyByChainId } from "@/helpers/chainHelpers";
import { NetworkKeys } from "@/types/Chains";
import { useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";

import { useAppKitAccount } from "@reown/appkit/react";
import { Signer } from "ethers";
import { BrowserProvider } from "ethers";

import { useCallback, useEffect, useState } from "react";

export default function useSigner() {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  const [Signer, setSigner] = useState<Signer | null>(null);
  const [ACTIVE_NETWORK, setActiveNetwork] = useState<NetworkKeys>();

  const getProvider = useCallback(async () => {
    if (!Signer) {
      const provider = new BrowserProvider(walletProvider as any);
      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      const networkKey = getNetworkKeyByChainId(Number(chainId))!;
      setActiveNetwork(networkKey);
      return newSigner;
    }
    return Signer;
  }, [Signer, walletProvider]);

  const getBlock = useCallback(
    async (blockNumber: number) => {
      if (!walletProvider) return null;
      const provider = new BrowserProvider(walletProvider as any);
      return await provider.getBlock(blockNumber);
    },
    [walletProvider]
  );

  useEffect(() => {
    if (!Signer && walletProvider) {
      getProvider();
    }

    if (Signer && !ACTIVE_NETWORK) {
      const networkKey = getNetworkKeyByChainId(Number(chainId))!;
      setActiveNetwork(networkKey);
    }
  }, [walletProvider, Signer, getProvider]);

  return { Signer, address, getProvider, ACTIVE_NETWORK, getBlock };
}
