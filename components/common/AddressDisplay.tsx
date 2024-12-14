"use client";

interface AddressDisplayProps {
  address: string;
  truncate?: boolean;
}

export function AddressDisplay({ address, truncate = true }: AddressDisplayProps) {
  if (!address) return null;
  
  if (truncate) {
    return (
      <span className="font-mono">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    );
  }

  return <span className="font-mono">{address}</span>;
}