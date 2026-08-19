/** @format */

"use client";

import { useEffect, useState } from "react";

const CACHE_TTL_MS = 60_000;

// Module-level cache so every consumer shares one fetch per minute.
let cachedPrice: number | null = null;
let cachedAt = 0;
let inflight: Promise<number | null> | null = null;

async function fetchEthPrice(): Promise<number | null> {
  if (cachedPrice !== null && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedPrice;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      if (!res.ok) return null;
      const data = await res.json();
      const price = data?.ethereum?.usd;
      if (typeof price !== "number") return null;
      cachedPrice = price;
      cachedAt = Date.now();
      return price;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/**
 * Live ETH/USD price from CoinGecko. Returns null until fetched or on any
 * failure — callers should hide USD figures rather than show a made-up number.
 */
export function useEthPrice(): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEthPrice().then((p) => {
      if (!cancelled) setPrice(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return price;
}
