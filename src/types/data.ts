// types/data.ts
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

export interface OIBoxData {
  openInterest: number;
  oiDelta: number;
  position: string;
  state: "openStrong" | "closeStrong" | "neutral";
}

export type OIBoxInput = {
  openInterest: number | null;
  prevOpenInterest: number | null;
  price: number;
  upper: number;
  lower: number;
};

export type LongShortPercent = {
  longPct: number;
  shortPct: number;
};

export type OIPositionState = "openStrong" | "closeStrong" | "neutral";

export type OIBoxOutput = {
  openInterest: number;
  oiDelta: number;
  state: OIPositionState;
  position: string;
  bias: number;
  band: {
    nearUpper: boolean;
    nearLower: boolean;
    mid: boolean;
    upper: number;
    lower: number;
    price: number;
  };
};
export interface IndicatorData {
  currentPrice?: number;
  sigma: number;
  rsi?: number | null;
  oi?: OIBoxData | null;
  upperBand: number;
  lowerBand: number;
  period: number;
  lastUpdated: string;
}

export type BTCRow = Omit<BTCData, "volume"> & { volume?: number };
