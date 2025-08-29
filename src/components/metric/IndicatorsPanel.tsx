"use client";

import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IndicatorData } from "@/types";
import { MetricCard } from "@/components";
import { DATE_SELECT_OPTIONS } from "@/utils";
import { EXTENDED_FIELDS } from "@/lib";
import { useLivePriceFromKline } from "@/hooks";

export default function IndicatorsPanel() {
  const price = useLivePriceFromKline();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["btc-indicators", selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/btc-data?period=${selectedPeriod}`);
      if (!response.ok) throw new Error("데이터를 가져오는데 실패했습니다.");
      const result = await response.json();
      return result.data.indicators as IndicatorData;
    },
    refetchInterval: 60000,
  });

  const getLabelByValue = (v: number) =>
    DATE_SELECT_OPTIONS.find((o) => o.value === v)?.label ?? String(v);

  const handlePeriodChange = (period: number) => {
    setSelectedPeriod(period);
    setOpen(false);
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const fields = EXTENDED_FIELDS;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>오류가 발생했습니다: {(error as Error).message}</p>
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
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center justify-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            계산 기간:
          </label>
          <div className="relative inline-block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-15 text-left"
            >
              {getLabelByValue(selectedPeriod)}
            </button>
            {open && (
              <ul
                role="listbox"
                className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto"
              >
                {DATE_SELECT_OPTIONS.map(({ value, label }) => {
                  const selected = value === selectedPeriod;
                  return (
                    <li
                      key={value}
                      role="option"
                      aria-selected={selected}
                      onClick={() => handlePeriodChange(value)}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        selected ? "bg-blue-50 font-medium" : ""
                      }`}
                    >
                      {label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            onClick={() => refetch()}
            className="cursor-pointer px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            🔄 새로고침
          </button>
        </div>

        {data?.lastUpdated && (
          <div className="flex flex-col text-center text-sm text-gray-500">
            <p>마지막 업데이트</p>
            {new Date(data.lastUpdated).toLocaleString("ko-KR")}
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-center text-blue-900 tabular-nums min-h-10 m-0 p-1 border-2 mb-3">
        {mounted && price != null ? (
          <>$ {price.toLocaleString()}</>
        ) : (
          <span className="text-gray-500">가격 수신 중...</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => {
          const val = data ? f.getValue(data) : null;
          if (val === null) return null;
          const sub =
            "getSub" in f && typeof f.getSub === "function"
              ? f.getSub(data!)
              : undefined;
          return (
            <MetricCard key={f.key} label={f.label} value={val} sub={sub} />
          );
        })}
      </div>
    </div>
  );
}
