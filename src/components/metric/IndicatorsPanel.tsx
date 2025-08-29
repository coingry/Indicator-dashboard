"use client";

import { useState } from "react";
import { useRef, useEffect, Dispatch, SetStateAction } from "react";
import type { IndicatorData } from "@/types";
import { MetricCard } from "@/components";
import { DATE_SELECT_OPTIONS, RESOLUTION_TO_SECONDS } from "@/utils";
import { EXTENDED_FIELDS } from "@/lib";

const RESOLUTION_SELECT_OPTIONS = Object.keys(RESOLUTION_TO_SECONDS).map(
  (key) => ({ value: key, label: key.toUpperCase() })
);

type Props = {
  indicators?: IndicatorData;
  uiPeriod: number;
  uiReso: string;
  setUiPeriod: Dispatch<SetStateAction<number>>;
  setUiReso: Dispatch<SetStateAction<string>>;
  onRefresh: () => void;
};

export default function IndicatorsPanel({
  indicators,
  uiPeriod,
  uiReso,
  setUiPeriod,
  setUiReso,
  onRefresh,
}: Props) {
  const [openPeriod, setOpenPeriod] = useState(false);
  const [openReso, setOpenReso] = useState(false);

  const dropdownRefPeriod = useRef<HTMLDivElement>(null);
  const dropdownRefReso = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRefPeriod.current && !dropdownRefPeriod.current.contains(e.target as Node)) {
      setOpenPeriod(false);
    }
    if (dropdownRefReso.current && !dropdownRefReso.current.contains(e.target as Node)) {
      setOpenReso(false);
    }
  };

  useEffect(() => {
    if (openPeriod || openReso) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPeriod, openReso]);

  const getLabelByValue = (v: number) =>
    DATE_SELECT_OPTIONS.find((o) => o.value === v)?.label ?? String(v);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">기간:</label>
          <div className="relative" ref={dropdownRefPeriod}>
            <button
              type="button"
              onClick={() => setOpenPeriod((v) => !v)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-16 text-left"
            >
              {getLabelByValue(uiPeriod)}
            </button>
            {openPeriod && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                {DATE_SELECT_OPTIONS.map(({ value, label }) => {
                  const selected = value === uiPeriod;
                  return (
                    <li
                      key={value}
                      onClick={() => {
                        setUiPeriod(value);
                        setOpenPeriod(false);
                      }}
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
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">분봉:</label>
          <div className="relative" ref={dropdownRefReso}>
            <button
              type="button"
              onClick={() => setOpenReso((v) => !v)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-16 text-left"
            >
              {uiReso.toUpperCase()}
            </button>
            {openReso && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                {RESOLUTION_SELECT_OPTIONS.map(({ value, label }) => {
                  const selected = value === uiReso;
                  return (
                    <li
                      key={value}
                      onClick={() => {
                        setUiReso(value);
                        setOpenReso(false);
                      }}
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
        </div>

        <button
          onClick={onRefresh}
          className="cursor-pointer px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          🔄 새로고침
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicators &&
          EXTENDED_FIELDS.map((f) => {
            const val = f.getValue(indicators);
            if (val === null) return null;
            const sub =
              "getSub" in f && typeof f.getSub === "function"
                ? f.getSub(indicators)
                : undefined;
            return <MetricCard key={f.key} label={f.label} value={val} sub={sub} />;
          })}
      </div>
    </div>
  );
}
