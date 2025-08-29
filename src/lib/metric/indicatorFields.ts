// lib/indicatorFields.ts
import type { FieldSpec } from "@/types/indicators";
import { fCurrency, fPercent, fFixed } from "@/utils/formatter";

export const EXTENDED_FIELDS: FieldSpec[] = [
  {
    key: "sigma",
    label: "σ (표준편차)",
    getValue: (d) => (d.sigma != null ? `${d.sigma.toFixed(4)}%` : null),
  },
  {
    key: "sigmaAbsolute",
    label: "σ 절대폭",
    getValue: (d) => fCurrency(d.sigmaAbsolute),
    getSub: () => "± 기준",
  },
  {
    key: "upperBand",
    label: "상단 밴드 (+1σ)",
    getValue: (d) => fCurrency(d.upperBand),
  },
  {
    key: "lowerBand",
    label: "하단 밴드 (-1σ)",
    getValue: (d) => fCurrency(d.lowerBand),
  },
  {
    key: "rsi",
    label: "RSI (14)",
    getValue: (d) => (d.rsi == null ? null : fFixed(d.rsi, 1)),
    getSub: (d) =>
      d.rsi == null
        ? undefined
        : d.rsi >= 60
        ? "과매수"
        : d.rsi <= 40
        ? "과매도"
        : "중립",
  },
  {
    key: "position",
    label: "포지션 분석",
    getValue: (d) => d.position ?? null,
  },
  {
    key: "delta1D",
    label: "변동률 (1일)",
    getValue: (d) => (d.delta1D == null ? null : fPercent(d.delta1D, 2)),
  },
  {
    key: "delta4H",
    label: "변동률 (4시간)",
    getValue: (d) => (d.delta4H == null ? null : fPercent(d.delta4H, 2)),
  },
  {
    key: "delta1H",
    label: "변동률 (1시간)",
    getValue: (d) => (d.delta1H == null ? null : fPercent(d.delta1H, 2)),
  },
  {
    key: "alert",
    label: "돌파 정보",
    getValue: (d) =>
      d.alert == null ? null : d.alert ? "🚨 돌파 발생" : "✅ 정상 범위",
    getSub: (d) =>
      d.multiple != null ? `배수: ${d.multiple.toFixed(2)}σ` : undefined,
  },
];
