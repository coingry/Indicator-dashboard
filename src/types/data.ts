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
  priceDelta?: number;
  position: string;
  strength:
    | "-"
    | "미미"
    | "보통(증가)"
    | "보통(감소)"
    | "강(신규 진입)"
    | "강(정리)";
  state: "New Long" | "New Short" | "Short Cover" | "Long Cover" | "Neutral";
}

export type OIStrengthLevel =
  | "-"
  | "미미"
  | "보통(증가)"
  | "보통(감소)"
  | "강(신규 진입)"
  | "강(정리)";

export type OIBoxInput = {
  openInterest: number | null;
  prevOpenInterest: number | null;
  price: number;
  priceDelta: number;
  upper: number;
  lower: number;
};

export type LongShortPercent = {
  longPct: number;
  shortPct: number;
};

export type OIPositionState =
  | "New Long"
  | "New Short"
  | "Short Cover"
  | "Long Cover"
  | "Neutral";

export type OIBoxOutput = {
  openInterest: number;
  oiDelta: number;
  state: OIPositionState;
  position: string;
  strength: OIStrengthLevel;
  priceDelta?: number;
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
