// lib/api/btc.ts
import type { BTCRow } from "@/types";

// 전체 로드
export async function fetchBTCData(period = 300): Promise<BTCRow[]> {
  const res = await fetch(`/api/btc-data?period=${period}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`BTC data fetch failed: ${res.status}`);
  const json = await res.json();
  return (json?.data?.btcData ?? []) as BTCRow[];
}

// 증분 로드
export async function fetchBTCIncremental(
  lastTimestamp: number,
  overlap = 300
): Promise<BTCRow[]> {
  const res = await fetch(`/api/btc-data?since=${lastTimestamp}&overlap=${overlap}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`BTC incremental fetch failed: ${res.status}`);
  const json = await res.json();
  return (json?.data?.btcData ?? []) as BTCRow[];
}