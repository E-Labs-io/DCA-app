"use client";

import { useEffect, useState } from "react";

/**
 * Public-beta disclosure banner.
 *
 * V0.9 is shipped as a public beta: no audit, no paid bug bounty, no TVL
 * cap on the contracts. Users must see this before interacting. Dismissible
 * once per session (localStorage) so it doesn't nag, but always available
 * via the "Learn more" link to docs/beta.
 *
 * Kept deliberately loud — "Public Beta — not audited — funds at risk" is
 * the line that keeps this beta a defensible launch posture rather than a
 * negligence claim waiting to happen.
 */

const STORAGE_KEY = "ation_beta_banner_dismissed_v1";

export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 text-black px-4 py-2 shadow-md backdrop-blur"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="text-sm leading-snug">
          <span className="font-semibold">Public Beta.</span>{" "}
          Not audited. No bug bounty yet. Funds at risk.{" "}
          <a
            href="https://docs.ation.capital/beta"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:opacity-80"
          >
            Read the risk disclaimer →
          </a>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss beta banner"
          className="text-sm font-medium hover:opacity-70 shrink-0"
        >
          Got it ✕
        </button>
      </div>
    </div>
  );
}
