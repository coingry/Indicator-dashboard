// api/btc-data/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  calculateIndicators,
  computeSigma,
  aggregateToResolution,
  fetchRangeBTCData
} from "@/lib";
import { RESOLUTION_TO_SECONDS, DEFAULT_RESOLUTION } from "@/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const periodDays = Number(searchParams.get("period") || "30");
  const resolution = searchParams.get("resolution") || DEFAULT_RESOLUTION;
  const interval = RESOLUTION_TO_SECONDS[resolution];

  if (!interval) {
    return NextResponse.json(
      { success: false, error: "Unsupported resolution" },
      { status: 400 }
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const from = nowSec - periodDays * 86400;
  try {
    const rawData = await fetchRangeBTCData(from, nowSec);
    const processedData =
      resolution === "1m" ? rawData : aggregateToResolution(rawData, interval);

    const sigma = computeSigma(processedData);
    const indicators = calculateIndicators(processedData, periodDays, sigma);

    return NextResponse.json(
      {
        success: true,
        data: { indicators },
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