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
  DEFAULT_CONFIGS,
  RESOLUTION_LABEL,
} from "@/utils";
import { fetchRangeBTCData } from "@/lib/api/btc-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const defaultSigma = DEFAULT_CONFIGS.sigma!;
  const defaultRSI = DEFAULT_CONFIGS.rsi!;

  // σ(표준편차)용 파라미터
  const periodDays = Number(
    searchParams.get("period") || defaultSigma.periodDays
  );
  const resolution = searchParams.get("resolution") || defaultSigma.resolution;
  const interval = RESOLUTION_TO_SECONDS[resolution];
  const windowParam = searchParams.get("window");
  // window=ALL 이면 undefined로 넘김
  const windowSetting: number | undefined =
    windowParam === "ALL"
      ? undefined
      : Number(windowParam ?? defaultSigma.window);

  // RSI용 파라미터
  const rsiResolution =
    searchParams.get("rsiResolution") || defaultRSI.resolution;
  const rsiInterval = RESOLUTION_TO_SECONDS[rsiResolution];
  const rsiPeriod = Number(searchParams.get("rsiPeriod") || defaultRSI.period);

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

    const sigma = computeSigma(seriesSigma, windowSetting);
    const indicators = calculateIndicators(
      seriesSigma,
      periodDays,
      sigma,
      RESOLUTION_LABEL(resolution),
      windowSetting
    );
    const rsi = calculateRSI(seriesRSI, rsiPeriod);

    // console.log("[σ DEBUG] periodDays:", periodDays);
    // console.log("[σ DEBUG] resolution:", resolution);
    // console.log("[σ DEBUG] windowParam:", windowParam);
    // console.log("[σ DEBUG] windowSetting:", windowSetting);

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
