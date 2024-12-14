/** @format */

export interface AccountStats {
  totalStrategies: number;
  activeStrategies: number;
  totalExecutions: number;
  baseTokenBalances: { [key: string]: bigint };
  reinvestLibraryVersion: string;
}
