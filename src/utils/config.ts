// utils/config.ts

// 기간 설정
export const DATE_SELECT_OPTIONS = [
  { label: '30일', value: 30 },
  { label: '60일', value: 60 },
  { label: '90일', value: 90 },
];

// 개수 설정
export const NUMBER_SELECT_OPTIONS: { label: string; value: number | "ALL" }[] = [
  { label: '10개', value: 10 },
  { label: '20개', value: 20 },
  { label: '30개', value: 30 },
  { label: '50개', value: 50 },
  { label: '전체', value: 'ALL'},
];

// 분봉 설정
export const RESOLUTION_TO_SECONDS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

export function RESOLUTION_LABEL(res: string): string {
  switch (res) {
    case "1m": return "1분봉";
    case "5m": return "5분봉";
    case "15m": return "15분봉";
    case "1h": return "1시간봉";
    case "4h": return "4시간봉";
    case "1d": return "일봉";
    default: return res;
  }
}

export const DEFAULT_RESOLUTION = "1m";
export const DEFAULT_PERIOD = 30;
export const DEFAULT_NUM = 20;
export const ALLOWED_RESOLUTIONS = Object.keys(RESOLUTION_TO_SECONDS);

// Rsi 설정
export const RSI_PERIOD = 14;
export const RSI_OVERBOUGHT = 60.0;
export const RSI_OVERSOLD  = 40.0;

// 지표별 설정 타입
export type IndicatorConfigs = Partial<{
  sigma: {
    periodDays: number;
    resolution: string;
    window?: number | 'ALL';
  };
  rsi: {
    resolution: string;
    period: number;
    overbought: number;
    oversold: number;
  };
}>;

export const DEFAULT_CONFIGS: IndicatorConfigs = {
  sigma: { periodDays: DEFAULT_PERIOD, resolution: DEFAULT_RESOLUTION, window: DEFAULT_NUM },
  rsi: {
    resolution: DEFAULT_RESOLUTION,
    period: RSI_PERIOD,
    overbought: RSI_OVERBOUGHT,
    oversold: RSI_OVERSOLD,
  },
};

// oi data 설정
export const FAPI_BASE = 'https://fapi.binance.com'
export const SYMBOL = 'BTCUSDT'
export const OI_RAW_MIN = 0.05