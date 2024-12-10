/** @format */

import { useAppKitProvider } from "@reown/appkit/react";

import { useAppKitAccount } from "@reown/appkit/react";
import { Signer } from "ethers";
import { BrowserProvider } from "ethers";

import { useCallback, useEffect, useState } from "react";

export default function useSigner() {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [Signer, setSigner] = useState<Signer | null>(null);

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
  }, [walletProvider, Signer, getProvider]);

  return { Signer, address, getProvider };
}
