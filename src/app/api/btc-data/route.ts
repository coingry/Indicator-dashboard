// api/btc-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateIndicators, computeSigma } from "@/lib";
import { supabase } from "@/lib/supabase/server";
import type { BTCData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = Number(searchParams.get("period") || "30");

  const now = Math.floor(Date.now() / 1000);
  const from = now - period * 86400;
  const to = now;

  let btcData: BTCData[];

  try {
    btcData = await fetchAllBTCData(from, to);
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : "Fetch error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }

  // console.log(
  //   "🧪 [BTC Route] Last Timestamp (UTC):",
  //   btcData.at(-1)?.timestamp
  // );
  // console.log(
  //   "🧪 [BTC Route] Last Timestamp (KST):",
  //   new Date(
  //     (btcData.at(-1)?.timestamp ?? 0) * 1000 + 9 * 3600 * 1000
  //   ).toISOString()
  // );
  // console.log("🧪 [BTC Route] Loaded Rows:", btcData.length);

  const sigma = computeSigma(btcData);
  const indicators = calculateIndicators(btcData, period, sigma);

  return NextResponse.json(
    { success: true, data: { btcData, indicators } },
    { headers: { "Cache-Control": "no-store" } }
  );
}

async function fetchAllBTCData(from: number, to: number): Promise<BTCData[]> {
  const pageSize = 1000;
  const allRows: BTCData[] = [];
  let lastTimestamp: number | null = null;

  while (true) {
    let query = supabase
      .from("btc_chart_data")
      .select("timestamp, open, high, low, close")
      .order("timestamp", { ascending: true })
      .limit(pageSize);

    query = query.gte("timestamp", from).lte("timestamp", to);

    if (lastTimestamp !== null) {
      query = query.gt("timestamp", lastTimestamp);
    }

    const { data: rows, error } = await query;

    if (error) throw error;
    if (!rows || rows.length === 0) break;

    allRows.push(
      ...rows.map((row) => ({
        timestamp: row.timestamp,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: 0,
      }))
    );

    if (rows.length < pageSize) break;
    lastTimestamp = rows[rows.length - 1].timestamp;
  }

  return allRows;
}
