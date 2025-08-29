// config.ts

export const DATE_SELECT_OPTIONS = [
  { label: '30일', value: 30 },
  { label: '60일', value: 60 },
  { label: '90일', value: 90 },
]

export const RESOLUTION_TO_SECONDS: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

export const DEFAULT_RESOLUTION = "1m";
export const ALLOWED_RESOLUTIONS = Object.keys(RESOLUTION_TO_SECONDS);
