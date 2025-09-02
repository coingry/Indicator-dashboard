// app/chart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BTCChart, IndicatorsPanel } from "@/components";
import { useBtcIndicators } from "@/hooks/useBtcIndicators";
import { IndicatorSettingsUI } from "@/lib";
import { DEFAULT_CONFIGS, IndicatorConfigs } from "@/utils";
import { FieldSpec } from "@/types";
type IndicatorKey = FieldSpec["key"];

function ChartContent() {
  const [configs, setConfigs] = useState<IndicatorConfigs>(DEFAULT_CONFIGS);
  const [selectedKeys, setSelectedKeys] = useState<IndicatorKey[]>([]);
  const [draft, setDraft] = useState<IndicatorConfigs>(DEFAULT_CONFIGS);

  const addSelected = (k: IndicatorKey) =>
    setSelectedKeys((prev) => (prev.includes(k) ? prev : [...prev, k]));

  const removeSelected = (k: IndicatorKey) =>
    setSelectedKeys((prev) => prev.filter((x) => x !== k));

  useEffect(() => {
    setDraft(configs);
  }, [selectedKeys.join(","), configs]);

  const applyAll = () => {
    setConfigs(draft);
  };

  const { data, isLoading, error, refetch } = useBtcIndicators(configs);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto flex flex-col gap-6">
        <div className="flex basis-[75%] gap-2 h-[600px]">
          <div className="flex-1 bg-white shadow-lg p-1">
            <BTCChart />
          </div>

          <div className="w-[25%] bg-white shadow-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b-2">
              <h2 className="text-xl font-semibold text-gray-800">지표 정보</h2>
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
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <IndicatorsPanel
                indicators={data?.indicators}
                configs={configs}
                onSelectIndicator={addSelected}
              />
            )}
          </div>
        </div>

        {selectedKeys.length > 0 && (
          <div className="bg-white shadow-lg p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">지표 설정</h3>
              <div className="flex gap-2">
                <button
                  className="cursor-pointer px-2 py-1 text-sm border rounded font-bold"
                  onClick={() => setSelectedKeys([])}
                >
                  모두 닫기
                </button>
                <button
                  className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded font-bold"
                  onClick={applyAll}
                >
                  전체 적용
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {selectedKeys.map((k) => (
                <div key={k} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{k.toUpperCase()}</h4>
                    <button
                      onClick={() => removeSelected(k)}
                      className="cursor-pointer px-2 py-1 text-sm border rounded bg-red-500 text-white font-semibold"
                    >
                      제거
                    </button>
                  </div>
                  
                  {IndicatorSettingsUI[k]?.({
                    value: draft,
                    onChange: setDraft,
                  }) ?? (
                    <div className="text-gray-500">
                      이 지표는 별도 설정이 없습니다.
                    </div>
                  )}

                  {k === "rsi" && (
                    <div className="mt-3 text-right">
                      <button
                        className="cursor-pointer px-3 py-1 text-sm rounded font-semibold bg-black text-white"
                        onClick={() =>
                          setDraft((d) => ({ ...d, rsi: DEFAULT_CONFIGS.rsi }))
                        }
                      >
                        RSI 기본값
                      </button>
                    </div>
                  )}
                  {k === "sigma" && (
                    <div className="mt-3 text-right">
                      <button
                        className="cursor-pointer px-3 py-1 text-sm rounded font-semibold bg-black text-white"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            sigma: DEFAULT_CONFIGS.sigma,
                          }))
                        }
                      >
                        σ 기본값
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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
