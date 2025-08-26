// utils/chartOptions.ts
import type {
  DeepPartial,
  ChartOptions,
  CandlestickSeriesOptions,
  Time,
} from "lightweight-charts";
import { formatKST } from "@/utils/time";

/** 차트 공통 옵션 (필요시 override로 덮어쓰기 가능) */
export function getChartOptions(
  height = 450,
  overrides: DeepPartial<ChartOptions> = {}
): DeepPartial<ChartOptions> {
  const base: DeepPartial<ChartOptions> = {
    height,
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
  };
  // 얕은 머지 (필요하면 lodash.merge 같은 걸로 깊은 병합도 가능)
  return { ...base, ...overrides };
}

export const candleSeriesOptions: DeepPartial<CandlestickSeriesOptions> = {
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
};
