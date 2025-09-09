// types/data.ts
import { SigmaView } from "./sigma";
import { OIBoxData } from "./oi";

export type Kline = [
  openTimeMs: number,
  open: string,
  high: string,
  low: string,
  close: string,
  ...rest: unknown[]
];

export type DBRow = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};
export interface BTCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  currentPrice?: number;
  sigma: number;
  sigmaView?: SigmaView;
  rsi?: number | null;
  oi?: OIBoxData | null;
  upperBand: number;
  lowerBand: number;
  period: number;
  lastUpdated: string;
}

export type BTCRow = Omit<BTCData, "volume"> & { volume?: number };
