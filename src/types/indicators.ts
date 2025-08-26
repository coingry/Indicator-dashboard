import type { IndicatorData } from "@/types";
export type FieldKey =
  | "currentPrice"
  | "sigma"
  | "sigmaAbsolute"
  | "upperBand"
  | "lowerBand"
  | "rsi"
  | "position"
  | "delta1D"
  | "delta4H"
  | "delta1H"
  | "alert"
  | "multiple";

export type FieldSpec = {
  key: FieldKey;
  label: string;
  getValue: (d: IndicatorData) => string | null;
  getSub?: (d: IndicatorData) => string | undefined;
};
