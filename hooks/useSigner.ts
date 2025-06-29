/** @format */

import { getNetworkKeyByChainId } from "@/helpers/chainHelpers";
import { NetworkKeys } from "@/types/Chains";
import { useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";

import { useAppKitAccount } from "@reown/appkit/react";
import { Signer } from "ethers";
import { BrowserProvider } from "ethers";

import { useCallback, useEffect, useState, useRef } from "react";

export default function useSigner() {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  const [Signer, setSigner] = useState<Signer | null>(null);
  const [ACTIVE_NETWORK, setActiveNetwork] = useState<NetworkKeys>();
  const [isInitializing, setIsInitializing] = useState(false);
  const previousChainId = useRef<number | undefined>();

  const initializeSigner = useCallback(async () => {
    if (!walletProvider || !address || isInitializing) return null;

    setIsInitializing(true);
    try {
      const provider = new BrowserProvider(walletProvider as any);
      const newSigner = await provider.getSigner();
      const currentChainId = Number(chainId);
      const networkKey = getNetworkKeyByChainId(currentChainId);

      console.log(
        "Signer initialized for address:",
        address,
        "network:",
        networkKey,
        "chainId:",
        currentChainId
      );

      setSigner(newSigner);
      setActiveNetwork(networkKey);
      previousChainId.current = currentChainId;

      return newSigner;
    } catch (error) {
      console.error("Error initializing signer:", error);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [walletProvider, address, chainId, isInitializing]);

  const getProvider = useCallback(async () => {
    if (Signer && !isInitializing) {
      return Signer;
    }
    return await initializeSigner();
  }, [Signer, initializeSigner, isInitializing]);

  const getBlock = useCallback(
    async (blockNumber: number) => {
      if (!walletProvider) return null;
      const provider = new BrowserProvider(walletProvider as any);
      return await provider.getBlock(blockNumber);
    },
    [walletProvider]
  );

  // Initialize signer when wallet connects
  useEffect(() => {
    if (walletProvider && address && !Signer && !isInitializing) {
      console.log(
        "Wallet connected, initializing signer for address:",
        address
      );
      initializeSigner();
    }
  }, [walletProvider, address, Signer, initializeSigner, isInitializing]);

  // Handle network changes
  useEffect(() => {
    if (!chainId) return;

    const currentChainId = Number(chainId);
    const networkKey = getNetworkKeyByChainId(currentChainId);

    console.log(
      "Network detected - ChainId:",
      currentChainId,
      "NetworkKey:",
      networkKey
    );

    // Only reset signer if this is an actual network change (not initial setup)
    if (previousChainId.current && previousChainId.current !== currentChainId) {
      console.log(
        "Network changed from",
        previousChainId.current,
        "to",
        currentChainId,
        "- reinitializing signer"
      );
      setSigner(null);
      setActiveNetwork(networkKey);
      // Re-initialize signer after network change
      if (walletProvider && address) {
        setTimeout(() => initializeSigner(), 100);
      }
    } else if (!previousChainId.current) {
      // Initial network setup
      setActiveNetwork(networkKey);
      previousChainId.current = currentChainId;
    }
  }, [chainId, walletProvider, address, initializeSigner]);

  // Clear signer when wallet disconnects
  useEffect(() => {
    if (!address || !walletProvider) {
      console.log("Wallet disconnected, clearing signer");
      setSigner(null);
      setActiveNetwork(undefined);
      previousChainId.current = undefined;
    }
  }, [address, walletProvider]);

  return {
    Signer,
    address,
    getProvider,
    ACTIVE_NETWORK,
    getBlock,
    isInitializing,
  };
}
