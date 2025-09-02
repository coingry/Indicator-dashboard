// lib/indicatorRegistry.tsx
import React from "react";
import type { FieldSpec } from "@/types";
import {
  DATE_SELECT_OPTIONS,
  RESOLUTION_TO_SECONDS,
  DEFAULT_CONFIGS,
} from "@/utils";
import type { IndicatorConfigs } from "@/utils";
export type IndicatorKey = FieldSpec["key"];

const RESOLUTION_SELECT_OPTIONS = Object.keys(RESOLUTION_TO_SECONDS).map(
  (key) => ({ value: key, label: key.toUpperCase() })
);

function Select({
  value,
  onChange,
  options,
}: {
  value: string | number;
  onChange: (v: string | number) => void;
  options: { value: string | number; label: string }[];
}) {
  return (
    <select
      className="mt-1 w-full border rounded px-2 py-1"
      value={value}
      onChange={(e) =>
        onChange(
          isNaN(Number(e.target.value))
            ? e.target.value
            : Number(e.target.value)
        )
      }
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export const IndicatorSettingsUI: Record<
  IndicatorKey,
  (props: {
    value: IndicatorConfigs;
    onChange: (next: IndicatorConfigs) => void;
  }) => React.ReactNode
> = {
  // σ(표준편차): 기간(days) + 분봉
  sigma: ({ value, onChange }) => {
    const cfg = value.sigma ?? DEFAULT_CONFIGS.sigma!;
    return (
      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium">기간(일)</label> 
          <Select
            value={cfg.periodDays}
            onChange={(v) =>
              onChange({ ...value, sigma: { ...cfg, periodDays: Number(v) } })
            }
            options={DATE_SELECT_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">분봉</label>
          <Select
            value={cfg.resolution}
            onChange={(v) =>
              onChange({ ...value, sigma: { ...cfg, resolution: String(v) } })
            }
            options={RESOLUTION_SELECT_OPTIONS}
          />
        </div>
      </div>
    );
  },

  // RSI: period + 임계값
  rsi: ({ value, onChange }) => {
    const cfg = value.rsi ?? DEFAULT_CONFIGS.rsi!;
    return (
      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium">RSI 분봉</label>
          <Select
            value={cfg.resolution}
            onChange={(v) =>
              onChange({ ...value, rsi: { ...cfg, resolution: String(v) } })
            }
            options={RESOLUTION_SELECT_OPTIONS}
          />
        </div>
        <div>
          <label className="text-sm font-medium">RSI 기간(캔들 수)</label>
          <input
            type="number"
            min={2}
            className="mt-1 w-full border rounded px-2 py-1"
            value={cfg.period}
            onChange={(e) =>
              onChange({
                ...value,
                rsi: { ...cfg, period: Number(e.target.value) },
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">과매수 기준</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-2 py-1"
              value={cfg.overbought}
              onChange={(e) =>
                onChange({
                  ...value,
                  rsi: { ...cfg, overbought: Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">과매도 기준</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-2 py-1"
              value={cfg.oversold}
              onChange={(e) =>
                onChange({
                  ...value,
                  rsi: { ...cfg, oversold: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </div>
    );
  },

  // 아직 별도 설정이 없는 키들
  sigmaAbsolute: () => null,
  upperBand: () => null,
  lowerBand: () => null,
  position: () => null,
  delta1D: () => null,
  delta4H: () => null,
  delta1H: () => null,
  alert: () => null,
  multiple: () => null,
};
