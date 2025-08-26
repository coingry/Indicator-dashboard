// types/index.ts
export type OHLC = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

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
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IndicatorData {
  currentPrice: number
  sigma: number
  sigmaAbsolute: number
  upperBand: number
  lowerBand: number
  period: number
  lastUpdated: string
  // 추가 지표들
  upper2?: number
  lower2?: number
  upper3?: number
  lower3?: number
  multiple?: number | null
  alert?: boolean
  prevClose?: number
  // RSI
  rsi?: number | null
  // 시간대별 변동률
  delta1H?: number | null
  delta4H?: number | null
  delta1D?: number | null
  // 포지션 분석
  position?: string
  nearUpper?: boolean
  nearLower?: boolean
  bias?: number
}

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'error' | 'success'
}

export interface Settings {
  defaultPeriod: number
  refreshInterval: number
  dataSource: 'index' | 'mark' | 'last'
  alertThreshold: number
}

export type BTCRow = Omit<BTCData, "volume"> & { volume?: number };

export type Resolution =
  | "1m" | "5m" | "15m" | "30m"
  | "1h" | "4h" | "12h"
  | "1d" | "1w" | "1M";