/**
 * Env-gated debug logger.
 *
 * In development (NODE_ENV !== 'production') these pass through to console.*.
 * In production they're no-ops, so we don't spam end-user consoles with
 * internal structure (wallet addresses, strategy IDs, account state).
 *
 * Use these instead of console.log / console.warn / console.error for any
 * internal debugging chatter. Reserve the real console.* for user-visible
 * errors we want them to report back.
 */

const DEV = process.env.NODE_ENV !== "production";

export const dbg = DEV ? console.log.bind(console) : () => {};
export const dbgWarn = DEV ? console.warn.bind(console) : () => {};
export const dbgError = DEV ? console.error.bind(console) : () => {};
