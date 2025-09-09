// lib/indicators.ts
import { BTCData, IndicatorData, SigmaState, SigmaView } from "@/types";

export function calculateIndicators(
  data: BTCData[],
  period: number,
  sigmaRaw: number,
  timeframeLabel?: string,
  window?: number | 'ALL'
): IndicatorData {
  if (data.length < 2) {
    throw new Error("σ 계산을 위해 최소 2개 봉이 필요합니다.");
  }

  const currentPrice = data[data.length - 1].close;
  const lastClose = data[data.length - 2].close;

  const sigmaAbsolute = lastClose * sigmaRaw;
  const upper1 = lastClose + sigmaAbsolute;
  const lower1 = lastClose - sigmaAbsolute;
  const sigmaPercent = sigmaRaw * 100;

  const z = (currentPrice - lastClose) / sigmaAbsolute;

  let state: SigmaState;
  if (z >= 1) {
    state = { type: "UPPER_BREAK", z, beyond: z - 1 };
  } else if (z <= -1) {
    state = { type: "LOWER_BREAK", z, beyond: -(z + 1) };
  } else {
    state = { type: "INSIDE", z, toUpper: 1 - z, toLower: 1 + z };
  }

  const sigmaView: SigmaView = {
    currentPrice,
    sigma: sigmaPercent,
    sigmaRaw,
    lastClose,
    upperBand: upper1,
    lowerBand: lower1,
    z,
    state,
    timeframeLabel,
    window,
    period,
    lastUpdated: new Date().toISOString(),
  };

  return {
    currentPrice,
    sigma: sigmaPercent,
    upperBand: upper1,
    lowerBand: lower1,
    period,
    lastUpdated: sigmaView.lastUpdated,
    sigmaView,
  };
}
