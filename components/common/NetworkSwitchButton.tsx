/** @format */

"use client";

/**
 * Custom network-switch button.
 *
 * The Reown AppKit ships `<appkit-network-button />` as a web component.
 * It works, but it doesn't match our NextUI styling and has no easy way
 * to scope to specific chains — for V0.9 we want users who land on ETH
 * Mainnet or Arbitrum to be offered a one-click switch to Base or
 * Optimism, not the full AppKit chain picker.
 *
 * This component does exactly that: presents one button per supported
 * chain, styled consistently with the rest of the UI, calling AppKit's
 * `switchNetwork` directly. Falls back to a list of chain names if
 * switchNetwork isn't available (shouldn't happen in practice).
 *
 * Usage in ConnectionCard / wrong-network fallback:
 *
 *   <NetworkSwitchButton
 *     supportedChains={[base, baseSepolia, optimism, optimismSepolia]}
 *     currentChainId={chainId}
 *   />
 */

import React from "react";
import { Button } from "@nextui-org/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { dbgError } from "@/helpers/debug";

interface Props {
  /** Array of viem/AppKit chains to offer. Order determines button order. */
  supportedChains: AppKitNetwork[];
  /** Current chainId from useAppKitNetwork — button for current chain is disabled. */
  currentChainId?: number | string;
  /** Extra tailwind classes for the wrapper. */
  className?: string;
}

export function NetworkSwitchButton({
  supportedChains,
  currentChainId,
  className,
}: Props): React.ReactElement {
  const { switchNetwork } = useAppKitNetwork();

  const current =
    typeof currentChainId === "string" ? Number(currentChainId) : currentChainId;

  const onClick = async (chain: AppKitNetwork) => {
    try {
      // AppKit's switchNetwork handles both wallet-prompt and direct
      // RPC switching. We just fire-and-forget; the app re-renders
      // when chainId changes upstream.
      await switchNetwork(chain);
    } catch (err) {
      // Most common failure: user rejected. Second most: wallet doesn't
      // have the chain added yet — AppKit usually adds it automatically,
      // but some injected wallets refuse. Either way, surface in dev
      // logs and let the user try another.
      dbgError("[NetworkSwitchButton] switchNetwork failed", err);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ""}`}
    >
      {supportedChains.map((chain) => {
        const isCurrent = current === chain.id;
        return (
          <Button
            key={chain.id}
            size="sm"
            variant={isCurrent ? "flat" : "bordered"}
            color={isCurrent ? "success" : "primary"}
            isDisabled={isCurrent}
            onPress={() => onClick(chain)}
          >
            {isCurrent ? `✓ On ${chain.name}` : `Switch to ${chain.name}`}
          </Button>
        );
      })}
    </div>
  );
}

export default NetworkSwitchButton;
