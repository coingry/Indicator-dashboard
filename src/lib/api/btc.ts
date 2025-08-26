// lib/api/btc.ts
import type { BTCRow } from "@/types";

export async function fetchBTCData(period = 300): Promise<BTCRow[]> {
  const res = await fetch(`/api/btc-data?period=${period}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`BTC data fetch failed: ${res.status}`);
  const json = await res.json();
  return (json?.data?.btcData ?? []) as BTCRow[];
}
