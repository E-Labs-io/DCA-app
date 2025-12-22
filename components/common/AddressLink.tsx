/** @format */

import React from "react";
import { ExternalLink } from "lucide-react";
import { buildNetworkScanLink } from "@/helpers/buildScanLink";
import { NetworkKeys } from "@/types";

interface AddressLinkProps {
  address: string;
  network?: NetworkKeys;
  label?: string;
  showFullAddress?: boolean;
  className?: string;
}

export function AddressLink({
  address,
  network = "BASE_MAINNET",
  label,
  showFullAddress = false,
  className = "",
}: AddressLinkProps) {
  const displayAddress = showFullAddress
    ? address
    : `${address.slice(0, 10)}...${address.slice(-6)}`;

  const scanLink = buildNetworkScanLink({
    network,
    address,
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm break-all">
        {label && <span className="text-gray-500">{label}: </span>}
        {showFullAddress ? address : displayAddress}
      </span>
      <button
        onClick={() => window.open(scanLink, "_blank", "noopener,noreferrer")}
        className="flex-shrink-0 p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        title={`View on block explorer`}
      >
        <ExternalLink size={14} />
      </button>
    </div>
  );
}

export function FullAddressLink({
  address,
  network = "BASE_MAINNET",
  className = "",
}: Omit<AddressLinkProps, "showFullAddress" | "label">) {
  const scanLink = buildNetworkScanLink({
    network,
    address,
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all flex-1">
        {address}
      </span>
      <button
        onClick={() => window.open(scanLink, "_blank", "noopener,noreferrer")}
        className="flex-shrink-0 p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        title={`View on block explorer`}
      >
        <ExternalLink size={16} />
      </button>
    </div>
  );
}
