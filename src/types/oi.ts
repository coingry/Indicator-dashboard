// types/oi.ts
export interface OIBoxData {
  openInterest: number;
  oiDelta: number;
  priceDelta?: number;
  position: string;
  strength: OIStrengthLevel;
  state: OIPositionState;
}

export type OIStrengthLevel =
  | "-"
  | "미미"
  | "보통(증가)"
  | "보통(감소)"
  | "강(신규 진입)"
  | "강(정리)";

export type OIPositionState =
  | "New Long"
  | "New Short"
  | "Short Cover"
  | "Long Cover"
  | "Neutral";

export type OIBoxInput = {
  openInterest: number | null;
  prevOpenInterest: number | null;
  price: number;
  priceDelta: number;
  upper: number;
  lower: number;
};

export type OIBoxOutput = {
  openInterest: number;
  oiDelta: number;
  state: OIPositionState;
  position: string;
  strength: OIStrengthLevel;
  priceDelta?: number;
  band: {
    nearUpper: boolean;
    nearLower: boolean;
    mid: boolean;
    upper: number;
    lower: number;
    price: number;
  };
};
