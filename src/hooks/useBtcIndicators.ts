// hooks/useBtcIndicators.ts
import { useQuery } from "@tanstack/react-query";
import type { IndicatorData } from "@/types";
import {
  DEFAULT_RESOLUTION,
  DEFAULT_PERIOD,
  type IndicatorConfigs,
} from "@/utils";

type IndicatorsResponse = {
  indicators: IndicatorData;
  lastUpdated?: number;
};

export function useBtcIndicators(configs?: IndicatorConfigs) {
  const sigmaPeriod = configs?.sigma?.periodDays ?? DEFAULT_PERIOD;
  const sigmaReso = configs?.sigma?.resolution ?? DEFAULT_RESOLUTION;

  const rsiReso = configs?.rsi?.resolution;
  const rsiPeriod = configs?.rsi?.period;
  const rsiOB = configs?.rsi?.overbought;
  const rsiOS = configs?.rsi?.oversold;

  const queryKey = [
    "btc-indicators",
    sigmaPeriod,
    sigmaReso,
    rsiReso,
    rsiPeriod,
    rsiOB,
    rsiOS,
  ];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<IndicatorsResponse> => {
      const qs = new URLSearchParams({
        period: String(sigmaPeriod),
        resolution: sigmaReso,
      });
      if (rsiReso) qs.set("rsiResolution", rsiReso);
      if (rsiPeriod != null) qs.set("rsiPeriod", String(rsiPeriod));
      if (rsiOB != null) qs.set("rsiOB", String(rsiOB));
      if (rsiOS != null) qs.set("rsiOS", String(rsiOS));

      const res = await fetch(`/api/btc-data?${qs.toString()}`);
      if (!res.ok) throw new Error("데이터를 가져오는데 실패했습니다.");
      const result = await res.json();
      const indicators = result.data.indicators as IndicatorData;

      return {
        indicators,
        lastUpdated: indicators?.lastUpdated
          ? new Date(indicators.lastUpdated).getTime()
          : undefined,
      };
    },
    refetchInterval: 30 * 1000,
  });
}
