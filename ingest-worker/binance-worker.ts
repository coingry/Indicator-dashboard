// ingest-worker/binance-worker.ts
import "dotenv/config";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

console.log("👋 [Start] worker init");

// ===== env =====
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RAW_SYMBOL = (process.env.SYMBOL || "BTC-USDT").toUpperCase();
const STREAM_HOST =
  process.env.BINANCE_STREAM_HOST || "wss://stream.binance.com:9443/ws";
const TABLE = process.env.TABLE_NAME || "btc_chart_data";
const SYMBOL = RAW_SYMBOL.replace(/[^A-Z0-9]/g, "");
const STREAM = `${SYMBOL.toLowerCase()}@kline_1m`;
const WS_URL = `${STREAM_HOST}/${STREAM}`;
const API_URL = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=1m&limit=1000&startTime=`;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

type KlineRow = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  created_at?: string;
};

type BinanceCandle = [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

console.log(`[Init] symbol=${SYMBOL}, ws=${WS_URL}`);

async function fillMissingFromLastTimestamp() {
  try {
    const { data, error } = await sb
      .from(TABLE)
      .select("timestamp")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;

    const last = data?.[0]?.timestamp ?? 0;
    const now = Math.floor(Date.now() / 1000);
    const gap = now - last;

    if (gap < 60) {
      console.log("[Backfill] 최신 데이터가 이미 있음 → skip");
      return;
    }

    console.log(`[Backfill] ${gap / 60}분치 누락된 데이터 수집 중...`);
    let start = (last + 60) * 1000;

    while (start < now * 1000) {
      const url = API_URL + start;
      const res = await fetch(url);
      const json = (await res.json()) as BinanceCandle[];

      if (!Array.isArray(json) || json.length === 0) break;

      const rows: KlineRow[] = json.map((c) => ({
        timestamp: Math.floor(c[0] / 1000),
        open: Number(c[1]),
        high: Number(c[2]),
        low: Number(c[3]),
        close: Number(c[4]),
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await sb
        .from(TABLE)
        .upsert(rows, { onConflict: "timestamp" });

      if (insertError) {
        console.error("[Supabase] backfill error", insertError.message);
        break;
      }

      console.log(`[Backfill] ${rows.length}개 추가`);
      const lastCandle = json.at(-1);
      if (!lastCandle) break;

      start = lastCandle[0] + 60_000;
      await new Promise((r) => setTimeout(r, 500));
    }
  } catch (err) {
    console.error("[Backfill] 실패:", err);
  }
}

let ws: WebSocket | null = null;
let retry = 1500;
let heartbeat: NodeJS.Timeout | null = null;

function connect() {
  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("[WS] connected");
    retry = 1500;
    heartbeat = setInterval(() => {
      try {
        ws?.ping();
      } catch {}
    }, 30_000);
  });

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const k = msg?.k;
      if (!k || !k.x) return; // 종가 확정된 캔들만 처리

      const row: KlineRow = {
        timestamp: Math.floor(k.t / 1000),
        open: Number(k.o),
        high: Number(k.h),
        low: Number(k.l),
        close: Number(k.c),
        created_at: new Date().toISOString(),
      };

      const { error } = await sb
        .from(TABLE)
        .upsert([row], { onConflict: "timestamp" });

      if (error) {
        console.error("[Supabase] upsert error", error.message);
      }
    } catch (e) {
      console.error("[WS] parse error", e);
    }
  });

  ws.on("error", (e) => {
    console.error("[WS] error", e);
  });

  ws.on("close", () => {
    console.warn("[WS] closed");
    if (heartbeat) clearInterval(heartbeat);
    setTimeout(connect, retry);
    retry = Math.min(retry * 2, 10_000);
  });
}

// ==== Start ====
(async () => {
  await fillMissingFromLastTimestamp();
  connect();
})();

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
