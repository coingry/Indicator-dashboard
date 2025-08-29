import { NextRequest, NextResponse } from "next/server";
import {
  calculateIndicators,
  computeSigma,
  aggregateToResolution,
} from "@/lib";
import { RESOLUTION_TO_SECONDS, DEFAULT_RESOLUTION } from "@/utils";
import { supabase } from "@/lib/supabase/server";
import type { BTCData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 1000;

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
  const to = nowSec;

  try {
    const rawData = await fetchRangeBTCData(from, to);

    // 봉 단위에 따라 가공
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

async function fetchRangeBTCData(from: number, to: number): Promise<BTCData[]> {
  const allRows: BTCData[] = [];
  let lastTs: number | null = null;

  while (true) {
    let query = supabase
      .from("btc_chart_data")
      .select("timestamp, open, high, low, close")
      .gte("timestamp", from)
      .lte("timestamp", to)
      .order("timestamp", { ascending: true })
      .limit(PAGE_SIZE);

    if (lastTs !== null) {
      query = query.gt("timestamp", lastTs);
    }

    const { data: rows, error } = await query;
    if (error) throw error;
    if (!rows || rows.length === 0) break;

    for (const r of rows) {
      allRows.push({
        timestamp: r.timestamp,
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: 0,
      });
    }

    if (rows.length < PAGE_SIZE) break;
    lastTs = rows[rows.length - 1].timestamp;
  }

  return allRows;
}
