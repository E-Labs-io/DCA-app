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
import { base } from "@reown/appkit/networks";

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
        onPress={() => open({ view: "Connect" })}
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
        <DropdownItem
          key="network"
          description="Switch to Base Mainnet"
          startContent={
            <div
              className={`w-2 h-2 rounded-full ${
                chainId === base.id ? "bg-success" : "bg-danger"
              }`}
            />
          }
          onPress={() => switchNetwork(base)}
        >
          Network: {chainId === base.id ? "Base" : "Wrong Network"}
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
