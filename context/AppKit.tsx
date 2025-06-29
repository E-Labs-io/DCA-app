/** @format */

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, base } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID;
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!projectId) {
  console.warn(
    "NEXT_PUBLIC_APPKIT_PROJECT_ID not found in environment variables"
  );
  throw new Error(
    "Please set your NEXT_PUBLIC_APPKIT_PROJECT_ID in .env.local"
  );
}

if (!alchemyKey) {
  console.warn(
    "NEXT_PUBLIC_ALCHEMY_API_KEY not found in environment variables"
  );
  throw new Error("Please set your NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local");
}

console.log(
  "AppKit initializing with project ID:",
  projectId.substring(0, 8) + "..."
);

const ethAdapter = new EthersAdapter();

try {
  createAppKit({
    adapters: [ethAdapter],
    networks: [sepolia, base],
    defaultNetwork: base,
    projectId,
    enableWalletConnect: true,
    enableCoinbase: true,
    enableInjected: true,

    metadata: {
      name: "Ation",
      description: "Decentralized Cost Averaging",
      url:
        typeof window !== "undefined"
          ? window.location.origin
          : "https://app.ation.capital",
      icons: ["https://ation.capital/icon.png"],
    },
    features: {
      socials: false,
      email: false,
      onramp: true,
      swaps: true,
      analytics: true,
    },
    // Add error handling for RPC failures
    allWallets: "SHOW",
    featuredWalletIds: [
      "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
      "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
    ],
  });
  console.log("AppKit initialized successfully");
} catch (error) {
  console.error("Failed to initialize AppKit:", error);
  throw error;
}

export default function AppKit({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
