// utils/aggregation.ts
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import type { BTCRow, Resolution } from "@/types";
import { CANDLE_RESOLUTIONS } from "@/utils";

/** 내부 집계 Map 을 초기화(최초 세팅) */
export function initAggregateMap(rows: BTCRow[], resolution: Resolution) {
  const interval = CANDLE_RESOLUTIONS[resolution];
  const map = new Map<number, BTCRow>();
  for (const c of rows) {
    const base = Math.floor(c.timestamp / interval) * interval;
    const prev = map.get(base);
    if (!prev) {
      map.set(base, { ...c, timestamp: base });
    } else {
      prev.high = Math.max(prev.high, c.high);
      prev.low = Math.min(prev.low, c.low);
      prev.close = c.close;
    }
  }
  return map;
}

/** 새 틱 1개를 해당 버킷에 반영(추가/갱신) */
export function upsertAggregateTick(
  map: Map<number, BTCRow>,
  tick: BTCRow,
  resolution: Resolution
) {
  const interval = CANDLE_RESOLUTIONS[resolution];
  const base = Math.floor(tick.timestamp / interval) * interval;
  const prev = map.get(base);
  if (!prev) {
    map.set(base, { ...tick, timestamp: base });
  } else {
    prev.high = Math.max(prev.high, tick.high);
    prev.low = Math.min(prev.low, tick.low);
    prev.close = tick.close;
    // open은 최초 생성 시 값 유지
  }
}

/** 정렬된 배열로 변환 (차트 setData 용) */
export function aggregateToSortedArray(map: Map<number, BTCRow>): BTCRow[] {
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/** 차트 포맷으로 변환 */
export function toCandles(rows: BTCRow[]): CandlestickData[] {
  return rows.map((d) => ({
    time: d.timestamp as UTCTimestamp,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));
}
/** 분 경계 정렬용 유틸(선택) */
export function msToNextMinute() {
  const now = Date.now();
  return 60_000 - (now % 60_000);
}
