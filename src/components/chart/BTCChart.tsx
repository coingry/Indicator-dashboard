"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Resolution, BTCRow } from "@/types";
import { fetchBTCData, fetchBTCIncremental } from "@/lib";
import { useBTCRealtimeSocket } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  getChartOptions,
  candleSeriesOptions,
  initAggregateMap,
  upsertAggregateTick,
  aggregateToSortedArray,
  toCandles,
  msToNextMinute,
} from "@/utils";

export default function BTCChart({
  resolution = "1m",
}: {
  resolution?: Resolution;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rawRef = useRef<BTCRow[]>([]);
  const aggMapRef = useRef<Map<number, BTCRow>>(new Map());
  const resolutionRef = useRef<Resolution>(resolution);

  const [loading, setLoading] = useState(true);

  const {
    data: rows = [],
    isFetched,
    isLoading: isQueryLoading,
  } = useQuery({
    queryKey: ["btc", "full", 180],
    queryFn: () => fetchBTCData(180),
  });

  useBTCRealtimeSocket((tick) => {
    const last = rawRef.current.at(-1);
    if (!last || tick.timestamp < last.timestamp) return;

    const next = [...rawRef.current];
    if (tick.timestamp === last.timestamp) next[next.length - 1] = tick;
    else next.push(tick);
    rawRef.current = next;

    upsertAggregateTick(aggMapRef.current, tick, resolutionRef.current);

    const latest = Array.from(aggMapRef.current.values()).reduce((a, b) =>
      a.timestamp > b.timestamp ? a : b
    );

    if (latest && seriesRef.current) {
      seriesRef.current.update({
        time: latest.timestamp as UTCTimestamp,
        open: latest.open,
        high: latest.high,
        low: latest.low,
        close: latest.close,
      });
    }
  });

  useEffect(() => {
    if (!chartContainerRef.current || !isFetched) return;

    const el = chartContainerRef.current;
    const chart = createChart(el, getChartOptions());
    chartRef.current = chart;

    const series = chart.addCandlestickSeries(candleSeriesOptions);
    seriesRef.current = series;

    rawRef.current = rows;
    aggMapRef.current = initAggregateMap(rows, resolutionRef.current);
    const initialAgg = aggregateToSortedArray(aggMapRef.current);
    const initialCandles = toCandles(initialAgg);
    series.setData(initialCandles);
    setLoading(false);

    const startPolling = async () => {
      try {
        const lastTs = rawRef.current.at(-1)?.timestamp;
        if (!lastTs) return;

        const inc = await fetchBTCIncremental(lastTs, 300);
        if (!inc?.length) return;

        const map = aggMapRef.current;
        for (const t of inc) upsertAggregateTick(map, t, resolutionRef.current);
        rawRef.current = mergeUniqueByTs(rawRef.current, inc);
        const agg = aggregateToSortedArray(map);
        series.setData(toCandles(agg));
      } catch (err) {
        console.error("증분 데이터 로딩 실패:", err);
      }
    };

    const t = setTimeout(() => {
      startPolling();
      pollRef.current = setInterval(startPolling, 60_000);
    }, msToNextMinute());

    chart.applyOptions({
      width: el.clientWidth,
      height: el.clientHeight,
    });
    const lastWRef = { current: 0 };
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (!chartRef.current) return;
      if (w > 0 && w !== lastWRef.current) {
        lastWRef.current = w;
        chartRef.current.applyOptions({ width: w });
      }
    });
    ro.observe(el);

    return () => {
      clearTimeout(t);
      if (pollRef.current) clearInterval(pollRef.current);
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [isFetched, rows]);

  useEffect(() => {
    resolutionRef.current = resolution;
    if (!seriesRef.current) return;

    aggMapRef.current = initAggregateMap(rawRef.current, resolution);
    const agg = aggregateToSortedArray(aggMapRef.current);
    seriesRef.current.setData(toCandles(agg));
  }, [resolution]);

  return (
    <div
      ref={chartContainerRef}
      // className="relative w-full h-full min-h-[450px]"
      className="relative w-full h-[480px] md:h-[560px]"
    >
      {(loading || isQueryLoading) && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
        </div>
      )}
    </div>
  );
}

function mergeUniqueByTs(base: BTCRow[], inc: BTCRow[]) {
  if (!inc?.length) return base;
  const m = new Map<number, BTCRow>();
  for (const r of base) m.set(r.timestamp, r);
  for (const r of inc) m.set(r.timestamp, r);
  return Array.from(m.values()).sort((a, b) => a.timestamp - b.timestamp);
}

// function mergeAppend(base: BTCRow[], inc: BTCRow[], cap?: number): BTCRow[] {
//   if (!inc?.length) return base;
//   const map = new Map<number, BTCRow>();
//   for (const r of base) map.set(r.timestamp, r);
//   for (const r of inc) map.set(r.timestamp, r);
//   let merged = Array.from(map.values()).sort(
//     (a, b) => a.timestamp - b.timestamp
//   );
//   if (cap && merged.length > cap) {
//     merged = merged.slice(merged.length - cap);
//   }
//   return merged;
// }

// function aggregate(rows: BTCRow[], resolution: Resolution): BTCRow[] {
//   const interval = CANDLE_RESOLUTIONS[resolution];
//   const map = new Map<number, BTCRow>();
//   for (const c of rows) {
//     const base = Math.floor(c.timestamp / interval) * interval;
//     const prev = map.get(base);
//     if (!prev) {
//       map.set(base, { ...c, timestamp: base });
//     } else {
//       prev.high = Math.max(prev.high, c.high);
//       prev.low = Math.min(prev.low, c.low);
//       prev.close = c.close;
//     }
//   }
//   return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
// }

// export default function BTCChart({
//   resolution = "1m",
// }: {
//   resolution?: Resolution;
// }) {
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
//   const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
//   const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const rawRef = useRef<BTCRow[]>([]);
//   const resolutionRef = useRef<Resolution>(resolution);
//   const [loading, setLoading] = useState(true);

//   const {
//     data: rows = [],
//     isFetched,
//     isLoading: isQueryLoading,
//   } = useQuery({
//     queryKey: ["btc", "full", 180],
//     queryFn: () => fetchBTCData(180),
//   });

//   useBTCRealtimeSocket((realtimeCandle) => {
//     const last = rawRef.current.at(-1);
//     if (!last || realtimeCandle.timestamp < last.timestamp) return;
//     const next = [...rawRef.current];
//     if (realtimeCandle.timestamp === last.timestamp) {
//       next[next.length - 1] = realtimeCandle;
//     } else if (realtimeCandle.timestamp > last.timestamp) {
//       next.push(realtimeCandle);
//     }
//     rawRef.current = next;
//     const agg = aggregate(next, resolutionRef.current);
//     const latest = agg.at(-1);
//     if (latest && seriesRef.current) {
//       seriesRef.current.update({
//         time: latest.timestamp as UTCTimestamp,
//         open: latest.open,
//         high: latest.high,
//         low: latest.low,
//         close: latest.close,
//       });
//     }
//   });

//   useEffect(() => {
//     if (!chartContainerRef.current || !isFetched) return;
//     const el = chartContainerRef.current;
//     const chart = createChart(el, getChartOptions());
//     chartRef.current = chart;
//     const series = chart.addCandlestickSeries(candleSeriesOptions);
//     seriesRef.current = series;

//     rawRef.current = rows;
//     const agg = aggregate(rows, resolutionRef.current);
//     const formatted: CandlestickData[] = agg.map((d) => ({
//       time: d.timestamp as UTCTimestamp,
//       open: d.open,
//       high: d.high,
//       low: d.low,
//       close: d.close,
//     }));
//     series.setData(formatted);
//     setLoading(false);

//     const pollIncremental = async () => {
//       try {
//         const lastTs = rawRef.current.at(-1)?.timestamp;
//         if (!lastTs) return;
//         const inc = await fetchBTCIncremental(lastTs, 300);
//         if (!inc?.length) return;
//         rawRef.current = mergeAppend(rawRef.current, inc);
//         const agg = aggregate(rawRef.current, resolutionRef.current);
//         const formatted: CandlestickData[] = agg.map((d) => ({
//           time: d.timestamp as UTCTimestamp,
//           open: d.open,
//           high: d.high,
//           low: d.low,
//           close: d.close,
//         }));
//         series.setData(formatted);
//       } catch (err) {
//         console.error("증분 데이터 로딩 실패:", err);
//       }
//     };

//     pollRef.current = setInterval(pollIncremental, 60_000);

//     const handleResize = () => {
//       if (!chartRef.current) return;
//       chartRef.current.applyOptions({ width: el.clientWidth });
//     };
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (pollRef.current) clearInterval(pollRef.current);
//       chart.remove();
//       chartRef.current = null;
//       seriesRef.current = null;
//     };
//   }, [isFetched, rows]);

//   return (
//     <div
//       ref={chartContainerRef}
//       className="relative w-full h-full min-h-[450px]"
//     >
//       {(loading || isQueryLoading) && (
//         <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
//         </div>
//       )}
//     </div>
//   );
// }
