/** @format */

"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";

/**
 * Light full-page overlay shown while a wallet signature prompt is
 * open. The page stays visible (and mounted) underneath — this only
 * signals "the wallet has focus right now". z-[60] sits above the app
 * chrome (z-50) and below the wallet's own modal.
 */
export default function WalletPromptOverlay() {
  return (
    <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl bg-content1 px-5 py-3 shadow-lg">
        <Spinner size="sm" />
        <span className="text-sm">Confirm in your wallet…</span>
      </div>
    </div>
  );
}
