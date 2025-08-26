"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IndicatorData } from "@/types";
import { DATE_SELECT_OPTIONS } from "@/lib";

export default function IndicatorsPanel() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["btc-indicators", selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/btc-data?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error("데이터를 가져오는데 실패했습니다.");
      }
      const result = await response.json();
      return result.data.indicators as IndicatorData;
    },
    refetchInterval: 60000,
  });

  const handlePeriodChange = (period: number) => {
    setSelectedPeriod(period);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>오류가 발생했습니다: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700">계산 기간:</label>
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DATE_SELECT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={() => refetch()}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          🔄 새로고침
        </button>
      </div>

      {/* 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 현재가 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="text-sm opacity-90">현재가</div>
          <div className="text-2xl font-bold">
            ${data?.currentPrice?.toLocaleString() || "0"}
          </div>
        </div>

        {/* σ (표준편차) */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="text-sm opacity-90">σ (표준편차)</div>
          <div className="text-2xl font-bold">
            {data?.sigma?.toFixed(4) || "0"}%
          </div>
        </div>

        {/* σ 절대폭 */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="text-sm opacity-90">σ 절대폭</div>
          <div className="text-2xl font-bold">
            ±${data?.sigmaAbsolute?.toLocaleString() || "0"}
          </div>
        </div>

        {/* ±1σ 밴드 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="text-sm opacity-90">±1σ 밴드</div>
          <div className="text-lg font-semibold">
            ${data?.upperBand?.toLocaleString() || "0"}
          </div>
          <div className="text-lg font-semibold">
            ${data?.lowerBand?.toLocaleString() || "0"}
          </div>
        </div>
      </div>

      {/* 추가 지표들 */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* RSI */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">RSI</div>
            <div className="text-2xl font-bold">
              {data.rsi ? data.rsi.toFixed(1) : "N/A"}
            </div>
            {data.rsi && (
              <div className="text-xs mt-1">
                {data.rsi >= 60 ? "과매수" : data.rsi <= 40 ? "과매도" : "중립"}
              </div>
            )}
          </div>

          {/* 포지션 분석 */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">포지션 분석</div>
            <div className="text-sm font-medium leading-tight">
              {data.position || "분석 중..."}
            </div>
          </div>

          {/* 시간대별 변동률 */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">변동률</div>
            <div className="text-xs space-y-1">
              <div>
                1일:{" "}
                {data.delta1D
                  ? `${data.delta1D >= 0 ? "+" : ""}${data.delta1D.toFixed(2)}%`
                  : "N/A"}
              </div>
              <div>
                4시간:{" "}
                {data.delta4H
                  ? `${data.delta4H >= 0 ? "+" : ""}${data.delta4H.toFixed(2)}%`
                  : "N/A"}
              </div>
              <div>
                1시간:{" "}
                {data.delta1H
                  ? `${data.delta1H >= 0 ? "+" : ""}${data.delta1H.toFixed(2)}%`
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* 돌파 정보 */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">돌파 정보</div>
            <div className="text-sm font-medium">
              {data.alert ? (
                <span className="text-red-200">🚨 돌파 발생</span>
              ) : (
                <span className="text-green-200">✅ 정상 범위</span>
              )}
            </div>
            {data.multiple && (
              <div className="text-xs mt-1">
                배수: {data.multiple.toFixed(2)}σ
              </div>
            )}
          </div>
        </div>
      )}

      {/* 마지막 업데이트 */}
      {data?.lastUpdated && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          마지막 업데이트: {new Date(data.lastUpdated).toLocaleString("ko-KR")}
        </div>
      )}
    </div>
  );
}
