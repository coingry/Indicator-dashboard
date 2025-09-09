// types/indicator.ts
import type { IndicatorData } from "@/types";

export type FieldKey = "sigma" | "rsi" | "oi";

export type FieldSpec = {
  key: FieldKey;
  label: string;
  getValue: (d: IndicatorData) => string | null;
  getSub?: (d: IndicatorData) => string | undefined;
};
