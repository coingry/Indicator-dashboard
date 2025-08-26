// utils/formatter.ts

// 통화 포맷 (USD 기준)
export const fCurrency = (n?: number | null): string | null =>
  typeof n === "number" ? `$${n.toLocaleString()}` : null;

// 퍼센트 포맷
export const fPercent = (n?: number | null, fd = 2): string | null =>
  typeof n === "number" ? `${n.toFixed(fd)}%` : null;

// 고정 소수점
export const fFixed = (n?: number | null, fd = 2): string | null =>
  typeof n === "number" ? n.toFixed(fd) : null;
