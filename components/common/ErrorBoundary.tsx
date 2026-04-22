/** @format */

"use client";

/**
 * Component-level error boundary.
 *
 * The Next.js app/error.tsx is a *route-level* error boundary — it
 * only catches errors thrown during the render of a route segment. It
 * does NOT catch errors inside nested views, modals, event handlers
 * during async work, or React's concurrent updates.
 *
 * For a DeFi app where a single failed contract call or malformed RPC
 * response can throw inside a hook, that gap matters: a crash in
 * StrategyView currently tears down the whole dashboard. One bad
 * strategy = the user can't see any of their other strategies.
 *
 * This boundary catches synchronous render-path errors inside whatever
 * subtree it wraps. It does NOT catch:
 *   - Errors in event handlers (tx submissions) — those go through
 *     our toast system in the hooks.
 *   - Errors in effects that reject promises without throwing — those
 *     should be caught by the effect author.
 *   - SSR-time errors — this is a client-only component (use client).
 *
 * Usage:
 *   <ErrorBoundary label="StrategyView">
 *     <StrategyView ... />
 *   </ErrorBoundary>
 *
 * The label shows up in the fallback UI and in logs, so when a user
 * screenshots a crash you can tell which subtree went down.
 */

import React from "react";
import { dbgError } from "@/helpers/debug";

interface Props {
  children: React.ReactNode;
  /** Short label shown in the fallback UI and logs. */
  label?: string;
  /** Optional custom fallback renderer. Receives the error + reset fn. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // dbgError is a no-op in production; console.error separately so
    // production crashes still reach whatever monitoring is running.
    // (Sonner toasts are in the hooks; this boundary is for render
    // crashes, not async ones.)
    dbgError(
      `[ErrorBoundary:${this.props.label ?? "unnamed"}]`,
      error,
      info.componentStack
    );
    // eslint-disable-next-line no-console
    console.error(
      `[ErrorBoundary:${this.props.label ?? "unnamed"}] render crash`,
      error.message
    );
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-500/40 bg-red-950/30 p-6 text-center">
          <div className="text-lg font-semibold text-red-300">
            Something broke rendering{" "}
            {this.props.label ? (
              <code className="rounded bg-black/40 px-1 text-sm">{this.props.label}</code>
            ) : (
              "this section"
            )}
          </div>
          <div className="text-sm text-red-200/80">
            {this.state.error.message || "Unknown error"}
          </div>
          <div className="text-xs text-red-200/50">
            The rest of the app should still work. Try the button below or
            refresh.
          </div>
          <button
            onClick={this.reset}
            className="mt-1 rounded-md border border-red-400/40 px-3 py-1 text-sm text-red-200 transition hover:bg-red-500/20"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
