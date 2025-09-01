// lib/api/btc-server.ts
import { supabase } from "@/lib/supabase/server";
import type { BTCData } from "@/types";

const PAGE_SIZE = 1000;

export async function fetchRangeBTCData(from: number, to: number): Promise<BTCData[]> {
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

    if (lastTs !== null) query = query.gt("timestamp", lastTs);

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
