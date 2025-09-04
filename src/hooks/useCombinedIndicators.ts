// hooks/useCombinedIndicators.ts
import { useBtcIndicators } from "./useBtcIndicators";
import { useOIBox } from "./useOiIndicator";

export function useCombinedIndicators(configs?: Parameters<typeof useBtcIndicators>[0]) {
  const {
    data: btcData,
    isLoading: isLoadingBtc,
    error: errorBtc,
    refetch: refetchBtc,
  } = useBtcIndicators(configs);

  const {
    data: oiData,
    isLoading: isLoadingOi,
    error: errorOi,
    refetch: refetchOi,
  } = useOIBox();

  const isLoading = isLoadingBtc || isLoadingOi;
  const error = errorBtc || errorOi;
  const refetch = () => {
    refetchBtc();
    refetchOi();
  };

  const combined = btcData?.indicators && oiData?.oi
    ? {
        indicators: {
          ...btcData.indicators,
          oi: oiData.oi,
        },
        lastUpdated: Math.max(
          btcData.lastUpdated ?? 0,
          oiData.lastUpdated ?? 0
        ),
      }
    : undefined;

  return {
    data: combined,
    isLoading,
    error,
    refetch,
  };
}
