/** @format */

// ethers v6 surfaces wallet rejections as code "ACTION_REJECTED"; the raw
// EIP-1193 numeric 4001 only survives at error.info.error.code. Checking
// error.code === 4001 (the old pattern) classifies real rejections as
// failures — which is how a mined transaction ended up showing a
// "Failed to create account" toast.
export const isUserRejection = (error: any): boolean =>
  error?.code === "ACTION_REJECTED" ||
  error?.code === 4001 ||
  error?.info?.error?.code === 4001 ||
  /rejected|denied/i.test(String(error?.message ?? ""));
