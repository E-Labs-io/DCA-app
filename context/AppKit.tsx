/** @format */

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, base } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID;
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!projectId) {
  throw new Error(
    "Please set your NEXT_PUBLIC_APPKIT_PROJECT_ID in .env.local"
  );
}

if (!alchemyKey) {
  throw new Error("Please set your NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local");
}

const ethAdapter = new EthersAdapter();

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
    url: "https://app.ation.capital",
    icons: ["https://ation.capital/icon.png"],
  },
  features: {
    socials: false,
    email: false,
    onramp: true,
    swaps: true,
    analytics: true,
  },
});

export default function AppKit({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
