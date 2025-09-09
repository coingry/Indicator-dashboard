// lib/indicatorFields.ts ⚫️
import type { FieldSpec, IndicatorData } from "@/types";
import { RSI_OVERBOUGHT, RSI_OVERSOLD } from "@/utils";
import { fPercent, fFixed } from "@/utils/formatter";

const rsiState = (v: number) =>
  v >= RSI_OVERBOUGHT ? "과매수" : v <= RSI_OVERSOLD ? "과매도" : "중립";

const rsiBadge = (state: string) =>
  state === "과매수" ? "🔴" : state === "과매도" ? "🔵" : "⚪️";

const oiBadge = (state: string) => {
  switch (state) {
    case "New Long":
      return "🟢";
    case "New Short":
      return "🔴";
    case "Short Cover":
      return "🟣";
    case "Long Cover":
      return "🟠";
    default:
      return "⚪️";
  }
};

function formatSigmaLine1(d: IndicatorData) {
  const sv = d.sigmaView;
  if (!sv) return null;
  return `표준편차(σ) ${sv.sigma.toFixed(4)}%`;
}

function formatSigmaState(d: IndicatorData): string | undefined {
  const sv = d.sigmaView;
  if (!sv) return undefined;
  const s = sv.state;

  switch (s.type) {
    case "UPPER_BREAK":
      return `상단밴드 돌파 (+${s.beyond.toFixed(2)}σ)`;
    case "LOWER_BREAK":
      return `하단밴드 이탈 (−${s.beyond.toFixed(2)}σ)`;
    case "INSIDE":
      return `Band 내 · 상단밴드까지 (${s.toUpper.toFixed(
        2
      )}σ) · 하단밴드까지 (${s.toLower.toFixed(2)}σ)`;
    default:
      return "";
  }
}

export const EXTENDED_FIELDS: FieldSpec[] = [
  {
    key: "sigma",
    label: "Volatility View (표준편차)",
    getValue: (d) => {
      if (!d.sigmaView) return null;
      return formatSigmaLine1(d);
    },
    getSub: (d) => {
      if (!d.sigmaView) return undefined;
      return formatSigmaState(d);
    },
  },
  {
    key: "rsi",
    label: "RSI",
    getValue: (d) => (d.rsi == null ? null : fFixed(d.rsi, 1)),
    getSub: (d) => {
      if (d.rsi == null) return undefined;
      const state = rsiState(d.rsi);
      return `${rsiBadge(state)} ${state}`;
    },
  },
  {
    key: "oi",
    label: "OI (미체결약정) / 가격변동률",
    getValue: (d) => {
      if (!d.oi) return null;
      const badge = oiBadge(d.oi.state);
      return `${badge} ${d.oi.position}`;
    },
    getSub: (d) => {
      if (!d.oi) return undefined;

      const oiDeltaNum = d.oi.oiDelta;
      const priceDeltaNum = d.oi.priceDelta;

      const oiDelta = fPercent(oiDeltaNum, 2);
      const priceDelta =
        priceDeltaNum == null ? "N/A" : fPercent(priceDeltaNum, 2);

      const getColor = (value: number | null | undefined) => {
        if (value == null) return "gray";
        if (value > 0) return "green";
        if (value < 0) return "red";
        return "gray";
      };

      const oiColor = getColor(oiDeltaNum);
      const priceColor = getColor(priceDeltaNum);

      return `
    <span style="color:${oiColor}">${oiDelta}</span> (${d.oi.strength})
    <>
    <span style="color:${priceColor}">${priceDelta}</span>
  `;
    },
  },
];
