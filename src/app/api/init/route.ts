// app/api/init/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import type { Kline, DBRow } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYMBOL = "BTCUSDT";
const INTERVAL = "1m";
const LIMIT = 1000;
const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
const ONE_MIN_MS = 60_000;

export async function GET() {
  try {
    const nowMs = Date.now();
    const startMs = nowMs - SIX_MONTHS_MS;

    let fromMs = startMs;
    let inserted = 0;

    while (fromMs < nowMs) {
      const url = new URL("https://api.binance.com/api/v3/klines");
      url.searchParams.set("symbol", SYMBOL);
      url.searchParams.set("interval", INTERVAL);
      url.searchParams.set("limit", String(LIMIT));
      url.searchParams.set("startTime", String(fromMs));

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`Binance ${res.status} ${res.statusText}`);

      const klines = (await res.json()) as unknown as Kline[];
      if (!Array.isArray(klines) || klines.length === 0) break;

      const rows: DBRow[] = klines.map(([openTimeMs, o, h, l, c]) => ({
        timestamp: Math.floor(openTimeMs / 1000),
        open: +o,
        high: +h,
        low: +l,
        close: +c,
      }));

      const { error } = await supabase
        .from("btc_chart_data")
        .upsert(rows, { onConflict: "timestamp" });
      if (error) throw error;

      inserted += rows.length;

      const lastOpenMs = klines[klines.length - 1][0];
      fromMs = lastOpenMs + ONE_MIN_MS;

      await new Promise((r) => setTimeout(r, 120));
    }

    return NextResponse.json(
      { success: true, inserted },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
