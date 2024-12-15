/** @format */

"use client";

import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";
import { NetworkKeys } from "@/types";

interface AddressDisplayProps {
  address: string;
  truncate?: boolean;
  link?: true;
  network?: NetworkKeys;
}

export function AddressDisplay({
  address,
  truncate = true,
  link,
  network,
}: AddressDisplayProps) {
  if (!address) return null;

  if (truncate) {
    if (link) {
      return (
        <a
          href={buildNetworkScanLink({ network: network!, address })}
          target="_blank"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </a>
      );
    } else
      return (
        <span className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      );
  }

  if (link) {
    return (
      <a
        href={buildNetworkScanLink({ network: network!, address })}
        target="_blank"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </a>
    );
  } else return <span className="font-mono">{address}</span>;
}
