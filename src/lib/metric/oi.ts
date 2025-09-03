// lib/oi.ts
import {
  OI_RAW_MIN,
  OI_DISPLAY_MIN,
  OI_OPEN_STRONG,
  OI_CLOSE_STRONG,
  NEAR_BAND,
} from "@/utils";

import type {
  OIBoxInput,
  OIBoxOutput,
  OIPositionState,
} from "@/types"

export function calculateOIDelta(prev: number, curr: number): number {
  if (!prev || !curr || prev === 0) return 0.0;
  const delta = ((curr - prev) / prev) * 100;
  const clipped = Math.abs(delta) < OI_RAW_MIN ? 0.0 : delta;
  return parseFloat(clipped.toFixed(2));
}

export function analyzePosition(
  price: number,
  upper: number,
  lower: number,
  oiDelta: number | null
): {
  nearUpper: boolean;
  nearLower: boolean;
  bias: number;
  position: string;
} {
  const sigmaAbs = (upper - lower) / 2;
  const mid = (upper + lower) / 2;
  const biasRaw = price - mid;
  const bias = Number.isFinite(biasRaw) ? parseFloat(biasRaw.toFixed(2)) : 0;

  const nearUpper =
    sigmaAbs > 0 ? Math.max(0, upper - price) / sigmaAbs <= NEAR_BAND : false;

  const nearLower =
    sigmaAbs > 0 ? Math.max(0, price - lower) / sigmaAbs <= NEAR_BAND : false;

  let position = "중립 구간 | 관망";

  if (nearUpper) {
    if (oiDelta !== null && oiDelta >= OI_OPEN_STRONG) {
      position = "상방 대기 | 롱 신규 유입";
    } else if (oiDelta !== null && oiDelta <= OI_CLOSE_STRONG) {
      position = "상방 대기 | 숏 정리 주도(지속성↓)";
    } else {
      position = "상방 대기 | 관망";
    }
  } else if (nearLower) {
    if (oiDelta !== null && oiDelta >= OI_OPEN_STRONG) {
      position = "하방 대기 | 숏 신규 유입";
    } else if (oiDelta !== null && oiDelta <= OI_CLOSE_STRONG) {
      position = "하방 대기 | 롱 정리 주도(반등 가능)";
    } else {
      position = "하방 대기 | 관망";
    }
  } else {
    if (oiDelta === null || Math.abs(oiDelta) < OI_DISPLAY_MIN) {
      position = "중앙 구간 | 관망";
    } else if (oiDelta > 0) {
      position = bias >= 0 ? "중앙 구간 | 롱 축적" : "중앙 구간 | 숏 축적";
    } else {
      position = bias >= 0 ? "중앙 구간 | 롱 정리" : "중앙 구간 | 숏 정리";
    }
  }

  return { nearUpper, nearLower, bias, position };
}

export function derivePositionState(
  oiDelta: number,
  nearUpper: boolean,
  nearLower: boolean
): OIPositionState {
  if (oiDelta >= OI_OPEN_STRONG) return "openStrong";
  if (oiDelta <= OI_CLOSE_STRONG) return "closeStrong";
  if (oiDelta > 0 && (nearUpper || nearLower)) return "openStrong";
  if (oiDelta < 0 && (nearUpper || nearLower)) return "closeStrong";
  return "neutral";
}

export function buildOIBoxData(input: OIBoxInput): OIBoxOutput {
  const { openInterest, prevOpenInterest, price, upper, lower } = input;

  const oiDelta =
    openInterest && prevOpenInterest
      ? calculateOIDelta(prevOpenInterest, openInterest)
      : 0.0;

  const { nearUpper, nearLower, bias, position } = analyzePosition(
    price,
    upper,
    lower,
    oiDelta
  );
  const state = derivePositionState(oiDelta, nearUpper, nearLower);

  return {
    openInterest: openInterest ?? 0,
    oiDelta,
    state,
    position,
    bias,
    band: {
      nearUpper,
      nearLower,
      mid: !(nearUpper || nearLower),
      upper,
      lower,
      price,
    },
  };
}
