// api/btc-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  calculateIndicators,
  computeSigma,
  aggregateToResolution,
  calculateRSI,
} from "@/lib";
import {
  RESOLUTION_TO_SECONDS,
  DEFAULT_RESOLUTION,
  RSI_PERIOD,
} from "@/utils";
import { fetchRangeBTCData } from "@/lib/api/btc-server"

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // σ(표준편차)용 파라미터
  const periodDays = Number(searchParams.get("period") || "30");
  const resolution = searchParams.get("resolution") || DEFAULT_RESOLUTION;
  const interval = RESOLUTION_TO_SECONDS[resolution];

  // RSI용 파라미터
  const rsiResolution = searchParams.get("rsiResolution") || resolution;
  const rsiInterval = RESOLUTION_TO_SECONDS[rsiResolution];
  const rsiPeriod = Number(searchParams.get("rsiPeriod") || RSI_PERIOD);

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
    const seriesSigma =
      resolution === "1m" ? rawData : aggregateToResolution(rawData, interval);
    const seriesRSI =
      rsiResolution === "1m"
        ? rawData
        : rsiResolution === resolution
        ? seriesSigma
        : aggregateToResolution(rawData, rsiInterval);

    const sigma = computeSigma(seriesSigma);
    const indicators = calculateIndicators(seriesSigma, periodDays, sigma);
    const rsi = calculateRSI(seriesRSI, rsiPeriod);

    return NextResponse.json(
      {
        success: true,
        data: {
          indicators: { ...indicators, rsi },
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
