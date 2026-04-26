/** @format */

"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Wallet, ExternalLink, ChevronDown, Power } from "lucide-react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import {
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  sepolia,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { ACTIVE_CHAIN } from "@/constants/contracts";
import { dbg } from '@/helpers/debug';

// Map a logical chain key to an AppKit network object + display name.
// Keep in sync with ACTIVE_CHAIN — anything in there must resolve here
// or the dropdown silently drops it.
function chainKeyToNetwork(
  key: string
): { network: AppKitNetwork; displayName: string } | null {
  switch (key) {
    case "BASE_MAINNET":
      return { network: base as unknown as AppKitNetwork, displayName: "Base" };
    case "BASE_SEPOLIA":
      return { network: baseSepolia as unknown as AppKitNetwork, displayName: "Base Sepolia" };
    case "OPT_MAINNET":
      return { network: optimism as unknown as AppKitNetwork, displayName: "Optimism" };
    case "OPT_SEPOLIA":
      return { network: optimismSepolia as unknown as AppKitNetwork, displayName: "Optimism Sepolia" };
    case "ETH_SEPOLIA":
      return { network: sepolia as unknown as AppKitNetwork, displayName: "Ethereum Sepolia" };
    default:
      return null;
  }
}

export default function WalletButton() {
  const { isConnected, address } = useAppKitAccount();
  const { open } = useAppKit();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[150px] h-[40px] bg-default-100 animate-pulse rounded-lg" />
    );
  }

  if (!isConnected) {
    return (
      <Button
        color="primary"
        variant="bordered"
        startContent={<Wallet size={18} />}
        onPress={async () => {
          dbg("[WalletButton] Connect button clicked");
          dbg("[WalletButton] open function:", typeof open, open);
          try {
            const result = open({ view: "Connect" });
            dbg("[WalletButton] open() result:", result);
          } catch (error) {
            console.error("[WalletButton] Error calling open():", error);
          }
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  const truncatedAddress = `${address?.slice(0, 6)}...${address?.slice(-4)}`;

  // Map current chainId to an explorer base URL. Falls back to Basescan
  // if we don't recognise the chain (mainnet bias is intentional — the
  // four V0.9 chains all have working block explorers).
  const explorerBase = (() => {
    const id = typeof chainId === "string" ? Number(chainId) : chainId;
    switch (id) {
      case base.id:
        return "https://basescan.org/address/";
      case baseSepolia.id:
        return "https://sepolia.basescan.org/address/";
      case optimism.id:
        return "https://optimistic.etherscan.io/address/";
      case optimismSepolia.id:
        return "https://sepolia-optimism.etherscan.io/address/";
      case sepolia.id:
        return "https://sepolia.etherscan.io/address/";
      default:
        return "https://basescan.org/address/";
    }
  })();
  const explorerUrl = `${explorerBase}${address}`;

  // Resolve ACTIVE_CHAIN entries to AppKit networks once. Anything that
  // doesn't map (e.g. a stale legacy key) is dropped silently.
  const supportedNetworks = ACTIVE_CHAIN
    .map((key) => chainKeyToNetwork(key as string))
    .filter((n): n is NonNullable<typeof n> => n !== null);

  const currentChainIdNum =
    typeof chainId === "string" ? Number(chainId) : chainId;
  const isOnSupportedChain = supportedNetworks.some(
    (n) => Number(n.network.id) === currentChainIdNum
  );

  // NextUI's <DropdownMenu> wants either a single child per slot or
  // the dynamic `items` API. The previous code mapped to an array
  // alongside static <DropdownItem>s, which TS rejects under strict
  // build (Vercel). Flatten everything into one dynamic-items list.
  type Item = {
    key: string;
    label: React.ReactNode;
    description?: string;
    startContent?: React.ReactNode;
    onPress?: () => void;
    className?: string;
    color?: "danger";
  };

  const items: Item[] = [
    ...supportedNetworks.map((n) => {
      const isCurrent = Number(n.network.id) === currentChainIdNum;
      return {
        key: `chain-${n.network.id}`,
        label: `${n.displayName}${isCurrent ? " (Current)" : ""}`,
        description: isCurrent ? "Connected here" : `Switch to ${n.displayName}`,
        startContent: (
          <div
            className={`w-2 h-2 rounded-full ${
              isCurrent ? "bg-success" : "bg-gray-400"
            }`}
          />
        ),
        onPress: isCurrent ? undefined : () => switchNetwork(n.network),
      } as Item;
    }),
    {
      key: "network-status",
      label: `Status: ${isOnSupportedChain ? "Supported Network" : "Unsupported Network"}`,
      startContent: (
        <div
          className={`w-2 h-2 rounded-full ${
            isOnSupportedChain ? "bg-success" : "bg-danger"
          }`}
        />
      ),
    },
    {
      key: "explorer",
      label: "View on Explorer",
      startContent: <ExternalLink size={18} />,
      onPress: () => window.open(explorerUrl, "_blank"),
    },
    {
      key: "disconnect",
      label: "Disconnect",
      startContent: <Power size={18} />,
      className: "text-danger",
      color: "danger",
    },
  ];

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          endContent={<ChevronDown size={18} />}
          startContent={<Wallet size={18} />}
        >
          {truncatedAddress}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Wallet Actions"
        items={items}
        onAction={(key) => {
          if (key === "disconnect") disconnect();
        }}
      >
        {(item) => {
          const it = item as Item;
          return (
            <DropdownItem
              key={it.key}
              description={it.description}
              startContent={it.startContent}
              onPress={it.onPress}
              className={it.className}
              color={it.color}
            >
              {it.label}
            </DropdownItem>
          );
        }}
      </DropdownMenu>
    </Dropdown>
  );
}
