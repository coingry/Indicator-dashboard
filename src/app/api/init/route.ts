// // app/api/init/route.ts
// import { NextResponse } from "next/server";
// import type { OHLC } from "@/types";
// import { supabase } from "@/lib/supabase/server";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// const SIX_MONTHS_IN_DAYS = 180;
// const MINUTES_PER_DAY = 1440;
// const TOTAL_CANDLES = SIX_MONTHS_IN_DAYS * MINUTES_PER_DAY;

// const API_URL = "https://min-api.cryptocompare.com/data/v2/histominute";
// const API_LIMIT = 2000;

// export async function GET() {
//   try {
//     const now = Math.floor(Date.now() / 1000);
//     const totalChunks = Math.ceil(TOTAL_CANDLES / API_LIMIT);
//     let to = now;
//     let inserted = 0;

//     for (let i = 0; i < totalChunks; i++) {
//       const url = `${API_URL}?fsym=BTC&tsym=USDT&limit=${API_LIMIT}&toTs=${to}`;
//       const res = await fetch(url);
//       const json = await res.json();

//       const candles = json?.Data?.Data ?? [];
//       if (candles.length === 0) break;

//       const rows = candles.map((c: OHLC) => ({
//         timestamp: c.time,
//         open: c.open,
//         high: c.high,
//         low: c.low,
//         close: c.close,
//       }));

//       const { error } = await supabase
//         .from("btc_chart_data")
//         .upsert(rows, { onConflict: "timestamp" });

//       if (error) throw error;

//       inserted += rows.length;
//       to = candles.at(-1).time - 60;
//       await new Promise((r) => setTimeout(r, 500));
//     }

//     return NextResponse.json(
//       { success: true, inserted },
//       { headers: { "Cache-Control": "no-store" } }
//     );
//   } catch (e: unknown) {
//     const error = e instanceof Error ? e.message : String(e);
//     return NextResponse.json(
//       { success: false, error },
//       { status: 500, headers: { "Cache-Control": "no-store" } }
//     );
//   }
// }

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
        .upsert(rows, { onConflict: "timestamp" }); // UNIQUE(timestamp) 필요
      if (error) throw error;

      inserted += rows.length;

      const lastOpenMs = klines[klines.length - 1][0];
      fromMs = lastOpenMs + ONE_MIN_MS; // 다음 청크로 전진

      await new Promise((r) => setTimeout(r, 120)); // rate limit 완화
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
