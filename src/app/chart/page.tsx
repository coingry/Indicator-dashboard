// app/chart/page.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BTCChart, IndicatorsPanel, LogPanel,SettingsPanel } from "@/components";
import { useBtcIndicators } from "@/hooks/useBtcIndicators";

function ChartContent() {
  const [uiPeriod, setUiPeriod] = useState(30);
  const [uiReso, setUiReso] = useState("1m");

  const [period, setPeriod] = useState(30);
  const [reso, setReso] = useState("1m");

  const { data, isLoading, error, refetch } = useBtcIndicators(period, reso);

  const onRefresh = () => {
    if (uiPeriod !== period || uiReso !== reso) {
      setPeriod(uiPeriod);
      setReso(uiReso);
    } else {
      refetch();
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full mx-auto flex flex-col gap-6">
          <div className="flex basis-[75%] gap-2 h-[600px]">
            <div className="flex-1 bg-white shadow-lg p-1">
              <BTCChart />
            </div>

            <div className="w-[25%] bg-white shadow-lg p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  지표 정보
                </h2>
                {data?.lastUpdated && (
                  <div className="flex flex-col text-right text-sm text-gray-700">
                    <p>마지막 업데이트</p>
                    {new Date(data.lastUpdated).toLocaleString("ko-KR")}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">
                  <p>오류가 발생했습니다: {(error as Error).message}</p>
                  <button
                    onClick={onRefresh}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <IndicatorsPanel
                  indicators={data?.indicators}
                  uiPeriod={uiPeriod}
                  uiReso={uiReso}
                  setUiPeriod={setUiPeriod}
                  setUiReso={setUiReso}
                  onRefresh={onRefresh}
                />
              )}
            </div>
          </div>

          {/* <div className="flex flex-1 basis-[30%] gap-6">
            <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📝 활동 로그
              </h2>
              <LogPanel />
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ⚙️ 설정
              </h2>
              <SettingsPanel />
            </div>
          </div> */}

        </div>
      </div>
  );
}

export default function ChartPage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ChartContent />
    </QueryClientProvider>
  );
}
