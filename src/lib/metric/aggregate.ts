// lib/metric/aggregate.ts
import type { BTCData } from "@/types";

export function aggregateToResolution(data: BTCData[], interval: number): BTCData[] {
  const map = new Map<number, BTCData>();

  for (const row of data) {
    const bucket = Math.floor(row.timestamp / interval) * interval;
    const existing = map.get(bucket);

    if (!existing) {
      map.set(bucket, { ...row, timestamp: bucket });
    } else {
      existing.high = Math.max(existing.high, row.high);
      existing.low = Math.min(existing.low, row.low);
      existing.close = row.close;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}
