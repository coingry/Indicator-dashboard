// components/chart/BTCChart.tsx
"use client";

import React, { useEffect, useRef, memo } from "react";
import type { BTCChartProps } from "@/types/chart";

function BTCChart({
  symbol = "BINANCE:BTCUSDT",
  interval = "1",
  range = "1D",
  theme = "light",
}: BTCChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.replaceChildren();

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(
      {
        allow_symbol_change: true,
        details: true,
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        hide_legend: false,
        hide_volume: false,
        interval,
        locale: "kr",
        save_image: true,
        style: "1",
        symbol,
        theme,
        timezone: "Asia/Seoul",
        backgroundColor: "#ffffff",
        gridColor: "rgba(46, 46, 46, 0.06)",
        watchlist: [],
        withdateranges: true,
        range,
        compareSymbols: [],
        studies: [],
        autosize: true,
      },
      null,
      2
    );

    el.appendChild(script);

    return () => {
      el.replaceChildren();
    };
  }, [symbol, interval, range, theme]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full min-h-[600px]"
    />
  );
}

export default memo(BTCChart);
