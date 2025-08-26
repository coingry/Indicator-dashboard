// config.ts
import type { Resolution } from "@/types";

export const DATE_SELECT_OPTIONS = [
  { label: '30일', value: 30 },
  { label: '60일', value: 60 },
  { label: '90일', value: 90 },
]

export const CANDLE_RESOLUTIONS = {
  "1m": 60,
  "5m": 5 * 60,
  "15m": 15 * 60,
  "30m": 30 * 60,
  "1h": 60 * 60,
  "4h": 4 * 60 * 60,
  "12h": 12 * 60 * 60,
  "1d": 24 * 60 * 60,
  "1w": 7 * 24 * 60 * 60,
  "1M": 30 * 24 * 60 * 60,
} satisfies Record<Resolution, number>;

export const CANDLE_LABELS = {
  "1m": "1분",
  "5m": "5분",
  "15m": "15분",
  "30m": "30분",
  "1h": "1시간",
  "4h": "4시간",
  "12h": "12시간",
  "1d": "1일",
  "1w": "1주",
  "1M": "1달",
} satisfies Record<Resolution, string>;

export const RESOLUTION_ORDER = [
  "1m", "5m", "15m", "30m", "1h", "4h", "12h", "1d", "1w", "1M",
] as const satisfies readonly Resolution[];
