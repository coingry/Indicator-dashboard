// hooks/useOiIndicator.ts
import { useQuery } from "@tanstack/react-query";
import type { OIBoxOutput } from "@/types";
import { buildOIBoxData } from "@/lib";

type OIResponse = {
  oi: OIBoxOutput;
  lastUpdated?: number;
};

export function useOIBox() {
  return useQuery<OIResponse>({
    queryKey: ["oi-box"],
    queryFn: async () => {
      const res = await fetch("/api/oi-data", { cache: "no-store" });
      const result = await res.json();

      const oi: OIBoxOutput = buildOIBoxData({
        openInterest: result.curr,
        prevOpenInterest: result.prev,
        price: result.price,
        priceDelta: result.price1mDelta,
        upper: result.upper,
        lower: result.lower,
      });

      return {
        oi,
        lastUpdated: Date.now(),
      };
    },
    refetchInterval: 30 * 1000,
  });
}
