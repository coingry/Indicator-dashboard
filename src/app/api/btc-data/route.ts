// api/btc-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  calculateIndicators,
  computeSigma,
  aggregateToResolution,
  fetchRangeBTCData,
  calculateRSI,
} from "@/lib";
import {
  RESOLUTION_TO_SECONDS,
  DEFAULT_RESOLUTION,
  RSI_PERIOD,
  RSI_OVERBOUGHT,
  RSI_OVERSOLD,
} from "@/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // σ(표준편차)용 글로벌 파라미터
  const periodDays = Number(searchParams.get("period") || "30");
  const resolution = searchParams.get("resolution") || DEFAULT_RESOLUTION;
  const interval = RESOLUTION_TO_SECONDS[resolution];

  // RSI 전용 파라미터
  const rsiResolution = searchParams.get("rsiResolution") || resolution;
  const rsiInterval = RESOLUTION_TO_SECONDS[rsiResolution];
  const rsiPeriod = Number(searchParams.get("rsiPeriod") || RSI_PERIOD);
  const rsiOB = Number(searchParams.get("rsiOB") || RSI_OVERBOUGHT);
  const rsiOS = Number(searchParams.get("rsiOS") || RSI_OVERSOLD);

  if (!interval || !rsiInterval) {
    return NextResponse.json(
      { success: false, error: "Unsupported resolution" },
      { status: 400 }
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const from = nowSec - periodDays * 86400;

  try {
    const rawData = await fetchRangeBTCData(from, nowSec);

    // σ용 시리즈 (글로벌 분봉)
    const seriesSigma =
      resolution === "1m" ? rawData : aggregateToResolution(rawData, interval);

    // ✅ RSI용 시리즈 (전용 분봉. σ와 같으면 재집계 생략)
    const seriesRSI =
      rsiResolution === "1m"
        ? rawData
        : rsiResolution === resolution
        ? seriesSigma
        : aggregateToResolution(rawData, rsiInterval);

    // σ 계산
    const sigma = computeSigma(seriesSigma);
    const indicators = calculateIndicators(seriesSigma, periodDays, sigma);

    // RSI 계산
    const rsi = calculateRSI(seriesRSI, rsiPeriod);

    // (옵션) 서버에서 상태 해석까지
    const rsiState =
      rsi == null
        ? null
        : rsi >= rsiOB
        ? "overbought"
        : rsi <= rsiOS
        ? "oversold"
        : "neutral";

    return NextResponse.json(
      {
        success: true,
        data: {
          // 프론트는 indicators만 받으면 됨
          indicators: { ...indicators, rsi },
          // (옵션) 메타/상태도 함께 내려주고 싶으면 아래 포함
          rsiMeta: {
            resolution: rsiResolution,
            period: rsiPeriod,
            overbought: rsiOB,
            oversold: rsiOS,
            state: rsiState,
          },
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
