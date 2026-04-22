/** @format */

"use client";

import { Card, CardBody } from "@nextui-org/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { base, baseSepolia, optimism, optimismSepolia } from "viem/chains";
import type { AppKitNetwork } from "@reown/appkit/networks";
import NetworkSwitchButton from "./NetworkSwitchButton";

interface ConnectionCardProps {
  isConnected: boolean;
  isWrongNetwork: boolean;
  /**
   * Human-readable network names. Kept for backwards compatibility with
   * the old API so AppContent still passes a display list. The actual
   * switch targets are the viem chain objects below.
   */
  supportedNetworks?: string[];
}

// Keep this mirror of ACTIVE_CHAIN next to the switch button so users
// never see a "Switch to X" offer for a chain the contracts aren't
// actually deployed to. Source of truth is constants/contracts.ts —
// this is the display layer that maps to viem chain objects.
const DEFAULT_SWITCH_TARGETS: AppKitNetwork[] = [
  base as unknown as AppKitNetwork,
  optimism as unknown as AppKitNetwork,
  baseSepolia as unknown as AppKitNetwork,
  optimismSepolia as unknown as AppKitNetwork,
];

export default function ConnectionCard({
  isConnected,
  isWrongNetwork,
  supportedNetworks = ["Base", "Optimism", "Base Sepolia", "Optimism Sepolia"],
}: ConnectionCardProps) {
  const { chainId } = useAppKitNetwork();

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        {!isConnected && (
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
            <p className="text-center text-gray-400 mb-6">
              Please connect your wallet to access the Ation Control
            </p>
            {/* AppKit's built-in connect button still handles wallet
                selection best — we only replace the network-switch UX,
                not wallet connection. */}
            <appkit-button />
          </CardBody>
        )}
        {isConnected && isWrongNetwork && (
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
            <p className="text-center text-gray-400 mb-6">
              Ation is available on: {supportedNetworks.join(", ")}. Pick
              one below to switch.
            </p>
            <NetworkSwitchButton
              supportedChains={DEFAULT_SWITCH_TARGETS}
              currentChainId={chainId}
            />
          </CardBody>
        )}
      </Card>
    </div>
  );
}
