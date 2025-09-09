// types/sigma.ts
export type SigmaState =
  | { type: "UPPER_BREAK"; z: number; beyond: number }
  | { type: "INSIDE"; z: number; toUpper: number; toLower: number }
  | { type: "LOWER_BREAK"; z: number; beyond: number };

export interface SigmaView {
  currentPrice: number;
  sigma: number;
  sigmaRaw: number;
  lastClose: number;
  upperBand: number;
  lowerBand: number;
  z: number;
  state: SigmaState;
  timeframeLabel?: string;
  window?: number | 'ALL';
  period: number; 
  lastUpdated: string;
}
