// "use client";

// import React, { useEffect, useRef } from "react";
// import {
//   createChart,
//   type ISeriesApi,
//   type CandlestickData,
//   type UTCTimestamp,
// } from "lightweight-charts";
// import { CANDLE_RESOLUTIONS } from "@/utils";
// import type { Resolution, BTCRow } from '@/types';
// import { fetchBTCData } from "@/lib";

// function aggregate(rows: BTCRow[], resolution: Resolution): BTCRow[] {
//   const interval = CANDLE_RESOLUTIONS[resolution];
//   const map = new Map<number, BTCRow>();

//   for (const c of rows) {
//     const base = Math.floor(c.timestamp / interval) * interval;
//     const prev = map.get(base);
//     if (!prev) {
//       map.set(base, {
//         timestamp: base,
//         open: c.open,
//         high: c.high,
//         low: c.low,
//         close: c.close,
//       });
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
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const rawRef = useRef<BTCRow[]>([]);

//   useEffect(() => {
//     if (!chartContainerRef.current) return;
//     const el = chartContainerRef.current;

//     const chart = createChart(chartContainerRef.current, {
//       // width: chartContainerRef.current.clientWidth,
//       height: el.clientHeight || 450,
//       layout: { background: { color: "#ffffff" }, textColor: "#333" },
//       grid: {
//         vertLines: { color: "#f0f0f0" },
//         horzLines: { color: "#f0f0f0" },
//       },
//       crosshair: { mode: 1 },
//       rightPriceScale: {
//         borderColor: "#cccccc",
//       },
//       timeScale: {
//         borderColor: "#cccccc",
//         timeVisible: true,
//         secondsVisible: false,
//         tickMarkFormatter: (time: number) => {
//           const date = new Date(time * 1000);
//           date.setHours(date.getHours() + 9);
//           return date.toISOString().slice(11, 16);
//         },
//       },
//     });
//     chartRef.current = chart;

//     const candlestickSeries = chart.addCandlestickSeries({
//       upColor: "#26a69a",
//       downColor: "#ef5350",
//       borderVisible: false,
//       wickUpColor: "#26a69a",
//       wickDownColor: "#ef5350",
//       priceFormat: {
//         type: "custom",
//         formatter: (price: number) => {
//           return price.toLocaleString("en-US", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//           });
//         },
//       },
//     });
//     seriesRef.current = candlestickSeries;

//     const fetchAndUpdate = async () => {
//       try {
//         const res = await fetch("/api/btc-data?period=300", {
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error("데이터 응답 실패");
//         const result = await res.json();
//         const rows: BTCRow[] = result?.data?.btcData ?? [];

//         if (!Array.isArray(rows) || rows.length === 0) return;

//         const formatted: CandlestickData[] = rows.map((d) => ({
//           time: d.timestamp as UTCTimestamp,
//           open: d.open,
//           high: d.high,
//           low: d.low,
//           close: d.close,
//         }));
//         candlestickSeries.setData(formatted);
//       } catch (err) {
//         console.error("차트 데이터 로딩 실패:", err);
//       }
//     };

//     fetchAndUpdate();
//     intervalRef.current = setInterval(fetchAndUpdate, 60000);

//     const handleResize = () => {
//       if (!chartContainerRef.current || !chartRef.current) return;
//       chartRef.current.applyOptions({
//         width: chartContainerRef.current.clientWidth,
//       });
//     };
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       chart.remove();
//       chartRef.current = null;
//       seriesRef.current = null;
//     };
//   }, []);

//   return (
//     <div className="w-full h-full">
//       <div ref={chartContainerRef} className="w-full h-full" />
//     </div>
//   );
// }
"use client";

import React, { useEffect, useRef } from "react";
import {
  createChart,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
  type Time,
  type BusinessDay,
} from "lightweight-charts";
import { CANDLE_RESOLUTIONS } from "@/utils";
import type { Resolution, BTCRow } from "@/types";
import { fetchBTCData } from "@/lib/api/btc";

function timeToDate(t: Time): Date {
  if (typeof t === "number") return new Date(t * 1000);
  const bd = t as BusinessDay;
  return new Date(Date.UTC(bd.year, bd.month - 1, bd.day));
}

function formatKST(t: Time): string {
  const d = timeToDate(t);
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  // "YYYY-MM-DD HH:mm"
  return kst.toISOString().replace("T", " ").slice(0, 16);
}

function aggregate(rows: BTCRow[], resolution: Resolution): BTCRow[] {
  const interval = CANDLE_RESOLUTIONS[resolution];
  const map = new Map<number, BTCRow>();
  for (const c of rows) {
    const base = Math.floor(c.timestamp / interval) * interval;
    const prev = map.get(base);
    if (!prev) {
      map.set(base, {
        timestamp: base,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });
    } else {
      prev.high = Math.max(prev.high, c.high);
      prev.low = Math.min(prev.low, c.low);
      prev.close = c.close;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export default function BTCChart({
  resolution = "1m",
}: {
  resolution?: Resolution;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawRef = useRef<BTCRow[]>([]);
  const resolutionRef = useRef<Resolution>(resolution);

  useEffect(() => {
    resolutionRef.current = resolution;
    if (seriesRef.current && rawRef.current.length) {
      const agg = aggregate(rawRef.current, resolution);
      const formatted: CandlestickData[] = agg.map((d) => ({
        time: d.timestamp as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      seriesRef.current.setData(formatted);
    }
  }, [resolution]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const el = chartContainerRef.current;

    const chart = createChart(el, {
      height: 450,
      layout: { background: { color: "#ffffff" }, textColor: "#333" },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      crosshair: { mode: 1 },
      localization: {
        locale: "ko-KR",
        dateFormat: "yyyy-MM-dd",
        timeFormatter: (t: Time) => formatKST(t),
      },
      rightPriceScale: { borderColor: "#cccccc" },
      timeScale: {
        borderColor: "#cccccc",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          date.setHours(date.getHours() + 9);
          return date.toISOString().slice(11, 16);
        },
      },
    });
    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "custom",
        formatter: (price: number) =>
          price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      },
    });
    seriesRef.current = series;

    const fetchAndUpdate = async () => {
      try {
        const rows = await fetchBTCData(300);
        if (!Array.isArray(rows) || rows.length === 0) return;

        rawRef.current = rows;
        const agg = aggregate(rows, resolutionRef.current);
        const formatted: CandlestickData[] = agg.map((d) => ({
          time: d.timestamp as UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));
        series.setData(formatted);
      } catch (err) {
        console.error("차트 데이터 로딩 실패:", err);
      }
    };

    fetchAndUpdate();
    intervalRef.current = setInterval(fetchAndUpdate, 60_000);

    const handleResize = () => {
      if (!chartRef.current) return;
      chartRef.current.applyOptions({ width: el.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (intervalRef.current) clearInterval(intervalRef.current);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
