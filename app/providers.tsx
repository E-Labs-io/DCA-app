/** @format */

"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, base } from "@reown/appkit/networks";

const queryClient = new QueryClient();

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
  projectId,
  enableWalletConnect: false,
  enableCoinbase: true,
  metadata: {
    name: "DCA Protocol",
    description: "Decentralized Cost Averaging",
    url: "https://app.ation.capital",
    icons: ["https://ation.capital/icon.png"],
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
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
  );
}
