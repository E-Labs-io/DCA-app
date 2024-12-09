/** @format */

"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!projectId) {
  throw new Error(
    "Please set your NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local"
  );
}

if (!alchemyKey) {
  throw new Error("Please set your NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local");
}

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`),
  },
  metadata: {
    name: "DCA Protocol",
    description: "Decentralized Cost Averaging",
    url: "https://ation.capital/app",
    icons: ["https://ation.capital/icon.png"],
  },
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  defaultChain: sepolia,
  chains: [sepolia],
  themeMode: "dark",
  themeVariables: {
    "--w3m-font-family": "Inter, sans-serif",
    "--w3m-accent": "rgb(var(--primary))",
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </NextThemesProvider>
        </NextUIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
