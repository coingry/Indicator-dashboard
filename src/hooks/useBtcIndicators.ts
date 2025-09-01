// hooks/useBtcIndicators.ts
import { useQuery } from "@tanstack/react-query";
import type { IndicatorData } from "@/types";

type IndicatorsResponse = {
  indicators: IndicatorData;
  lastUpdated?: number;
};

export function useBtcIndicators(period: number, reso: string) {
  return useQuery({
    queryKey: ["btc-indicators", period, reso],
    queryFn: async (): Promise<IndicatorsResponse> => {
      const res = await fetch(
        `/api/btc-data?period=${period}&resolution=${reso}`
      );
      if (!res.ok) throw new Error("데이터를 가져오는데 실패했습니다.");
      const result = await res.json();
      const indicators = result.data.indicators as IndicatorData;
      return {
        indicators,
        lastUpdated: new Date(indicators.lastUpdated).getTime(),
      };
    },
    // 자동 갱신
    // refetchInterval: 60000,
  });
}
