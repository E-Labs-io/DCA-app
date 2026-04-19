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
import { base, sepolia } from "@reown/appkit/networks";
import { ACTIVE_CHAIN } from "@/constants/contracts";

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
          console.log("[WalletButton] Connect button clicked");
          console.log("[WalletButton] open function:", typeof open, open);
          try {
            const result = open({ view: "Connect" });
            console.log("[WalletButton] open() result:", result);
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
  const explorerUrl = `https://basescan.org/address/${address}`;

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
      <DropdownMenu aria-label="Wallet Actions">
        {/* Network switching options */}
        {ACTIVE_CHAIN.map(chainKey => {
          const network = chainKey === "BASE_MAINNET" ? base : sepolia;
          const isCurrentNetwork = chainId === network.id;
          const networkName = chainKey === "BASE_MAINNET" ? "Base" : "Sepolia";

          return (
            <DropdownItem
              key={chainKey}
              description={`Switch to ${networkName}`}
              startContent={
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCurrentNetwork ? "bg-success" : "bg-gray-400"
                  }`}
                />
              }
              onPress={() => switchNetwork(network)}
            >
              {networkName} {isCurrentNetwork ? "(Current)" : ""}
            </DropdownItem>
          );
        })}
        <DropdownItem
          key="network-status"
          startContent={
            <div
              className={`w-2 h-2 rounded-full ${
                ACTIVE_CHAIN.some(chain =>
                  chain === "BASE_MAINNET" ? chainId === base.id :
                  chain === "ETH_SEPOLIA" ? chainId === sepolia.id : false
                ) ? "bg-success" : "bg-danger"
              }`}
            />
          }
        >
          Status: {
            ACTIVE_CHAIN.some(chain =>
              chain === "BASE_MAINNET" ? chainId === base.id :
              chain === "ETH_SEPOLIA" ? chainId === sepolia.id : false
            ) ? "Supported Network" : "Unsupported Network"
          }
        </DropdownItem>
        <DropdownItem
          key="explorer"
          startContent={<ExternalLink size={18} />}
          onPress={() => window.open(explorerUrl, "_blank")}
        >
          View on Explorer
        </DropdownItem>
        <DropdownItem
          key="disconnect"
          className="text-danger"
          color="danger"
          startContent={<Power size={18} />}
          onPress={() => disconnect()}
        >
          Disconnect
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
