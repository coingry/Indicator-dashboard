"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
} from "lightweight-charts";
import { CANDLE_RESOLUTIONS } from "@/utils";
import type { Resolution, BTCRow } from "@/types";
import { fetchBTCData } from "@/lib/api/btc";
import { getChartOptions, candleSeriesOptions } from "@/utils";

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
  const [loading, setLoading] = useState(true);
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

    const chart = createChart(el, getChartOptions());
    chartRef.current = chart;

    const series = chart.addCandlestickSeries(candleSeriesOptions);
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
      } finally {
        setLoading(false);
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
    <div
      ref={chartContainerRef}
      className="relative w-full h-full min-h-[450px]"
    >
      {loading && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
        </div>
      )}
    </div>
  );
}
