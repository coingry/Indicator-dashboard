// app/api/init/route.ts
import { NextResponse } from "next/server";
import type { OHLC } from "@/types";
import { supabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIX_MONTHS_IN_DAYS = 180;
const MINUTES_PER_DAY = 1440;
const TOTAL_CANDLES = SIX_MONTHS_IN_DAYS * MINUTES_PER_DAY;

const API_URL = "https://min-api.cryptocompare.com/data/v2/histominute";
const API_LIMIT = 2000;

export async function GET() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const totalChunks = Math.ceil(TOTAL_CANDLES / API_LIMIT);
    let to = now;
    let inserted = 0;

    for (let i = 0; i < totalChunks; i++) {
      const url = `${API_URL}?fsym=BTC&tsym=USDT&limit=${API_LIMIT}&toTs=${to}`;
      const res = await fetch(url);
      const json = await res.json();

      const candles = json?.Data?.Data ?? [];
      if (candles.length === 0) break;

      const rows = candles.map((c: OHLC) => ({
        timestamp: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const { error } = await supabase
        .from("btc_chart_data")
        .upsert(rows, { onConflict: "timestamp" });

      if (error) throw error;

      inserted += rows.length;
      to = candles.at(-1).time - 60;
      await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json(
      { success: true, inserted },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
