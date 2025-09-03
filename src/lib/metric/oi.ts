// lib/oi.ts
import type {
  OIBoxInput,
  OIBoxOutput,
  OIPositionState,
  OIStrengthLevel,
} from "@/types"

export function calculateOIDelta(prev: number, curr: number): number {
  if (!prev || !curr || prev === 0) return 0;
  const delta = ((curr - prev) / prev) * 100;
  // const clipped = Math.abs(delta) < OI_RAW_MIN ? 0.0 : delta;
  const clipped = Math.abs(delta);
  return parseFloat(clipped.toFixed(2));
}

export function analyzePositionSimple(
  oiDelta: number,
  priceDelta: number
): {
  position: string;
  flowSignal: string;
} {
  let position = "관망";
  let flowSignal = "Neutral";

  if (oiDelta > 0 && priceDelta > 0) {
    position = "신규 매수(롱) 유입";
    flowSignal = "New Long";
  } else if (oiDelta > 0 && priceDelta < 0) {
    position = "신규 매도(숏) 유입";
    flowSignal = "New Short";
  } else if (oiDelta < 0 && priceDelta > 0) {
    position = "숏 포지션 청산";
    flowSignal = "Short Cover";
  } else if (oiDelta < 0 && priceDelta < 0) {
    position = "롱 포지션 청산";
    flowSignal = "Long Cover";
  }

  return { position, flowSignal };
}

export function derivePositionState(
  oiDelta: number,
  priceDelta: number
): OIPositionState {
  if (oiDelta > 0 && priceDelta > 0) return "New Long";
  if (oiDelta > 0 && priceDelta < 0) return "New Short";
  if (oiDelta < 0 && priceDelta > 0) return "Short Cover";
  if (oiDelta < 0 && priceDelta < 0) return "Long Cover";
  return "Neutral";
}

export function getOIStrength(oiDelta: number): OIStrengthLevel {
  const abs = Math.abs(oiDelta);

  if (abs < 0.3) {
    return "미미";
  } else if (oiDelta > 0 && abs < 0.8) {
    return "보통(증가)";
  } else if (oiDelta < 0 && abs < 0.5) {
    return "보통(감소)";
  } else if (oiDelta >= 0.8) {
    return "강(신규 진입)";
  } else if (oiDelta <= -0.5) {
    return "강(정리)";
  } else {
    return "-";
  }
}


export function buildOIBoxData(input: OIBoxInput): OIBoxOutput {
  const { openInterest, prevOpenInterest, price, priceDelta, upper, lower } = input;

  const oiDelta =
    openInterest && prevOpenInterest
      ? calculateOIDelta(prevOpenInterest, openInterest)
      : 0.0;

  const { position, flowSignal } = analyzePositionSimple(oiDelta, priceDelta);
  const strength = getOIStrength(oiDelta);

  return {
    openInterest: openInterest ?? 0,
    oiDelta,
    priceDelta,
    state: flowSignal as OIPositionState,
    strength,
    position,
    band: {
      nearUpper: false,
      nearLower: false,
      mid: true,
      upper,
      lower,
      price,
    },
  };
}
