/** @format */

export enum ReinvestModuleCode {
  FORWARD = 0x01,
  AAVE_V3 = 0x12,
  COMPOUND_V3 = 0x11,
}

export interface ReinvestModule {
  id: number;
  name: string;
  description: string;
  protocolLogo: string;
  supportedTokens: string[]; // Token addresses supported by this module
}

export interface ReinvestStrategy {
  moduleId: number;
  moduleName: string;
  active: boolean;
  moduleData: string; // Encoded data for the specific module
  performanceMetrics?: {
    apy: number;
    totalReinvested: string;
    earnings: string;
  };
}
