// lib/indicatorFields.ts
import type { FieldSpec } from "@/types";
import { RSI_OVERBOUGHT, RSI_OVERSOLD } from "@/utils";
import { fCurrency, fPercent, fFixed } from "@/utils/formatter";

const rsiState = (v: number) =>
  v >= RSI_OVERBOUGHT ? "과매수" : v <= RSI_OVERSOLD ? "과매도" : "중립";

const rsiBadge = (state: string) =>
  state === "과매수" ? "🔴" : state === "과매도" ? "🔵" : "⚪️";

const oiBadge = (state: string) =>
  state === "openStrong" ? "🟢" : state === "closeStrong" ? "⚫️" : "⚪️";

export const EXTENDED_FIELDS: FieldSpec[] = [
  {
    key: "sigma",
    label: "σ (표준편차)",
    getValue: (d) => (d.sigma != null ? `${d.sigma.toFixed(4)}%` : null),
  },
  {
    key: "rsi",
    label: "RSI (14)",
    getValue: (d) => (d.rsi == null ? null : fFixed(d.rsi, 1)),
    getSub: (d) => {
      if (d.rsi == null) return undefined;
      const state = rsiState(d.rsi);
      return `${rsiBadge(state)} ${state}`;
    },
  },
  {
    key: "oi",
    label: "미체결약정",
    getValue: (d) =>
      d.oi?.openInterest != null ? fCurrency(d.oi.openInterest) : null,
    getSub: (d) => {
      if (!d.oi) return undefined;
      const delta = fPercent(d.oi.oiDelta, 2);
      const badge = oiBadge(d.oi.state);
      return `${badge} ${delta} / ${d.oi.position}`;
    },
  },
];
