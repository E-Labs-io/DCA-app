/** @format */

import { getNetworkKeyByChainId } from "@/lib/helpers/chainHelpers";
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
      return newSigner;
    }
    return Signer;
  }, [Signer, walletProvider]);

  useEffect(() => {
    if (!Signer && walletProvider) {
      getProvider();
    }

    if (Signer && !ACTIVE_NETWORK) {
      const networkKey = getNetworkKeyByChainId(Number(chainId))!;
      setActiveNetwork(networkKey);
      console.log("chainId", networkKey);
    }
  }, [walletProvider, Signer, getProvider]);

  return { Signer, address, getProvider, ACTIVE_NETWORK };
}
