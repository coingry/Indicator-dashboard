// components/metric/IndicatorsPanel.tsx
"use client";

import type { IndicatorData, FieldKey } from "@/types";
import { MetricCard } from "@/components";
import { EXTENDED_FIELDS } from "@/lib";
import { IndicatorConfigs, RESOLUTION_LABEL } from "@/utils";

type Props = {
  indicators?: IndicatorData;
  configs: IndicatorConfigs;
  onSelectIndicator?: (key: FieldKey) => void;
};

export default function IndicatorsPanel({
  indicators,
  configs,
  onSelectIndicator,
}: Props) {
  const labelWithConfig = (key: FieldKey, base: string) => {
    if (key === "sigma" && configs.sigma) {
      const { periodDays, resolution, window } = configs.sigma;
      const winLabel =
        window === undefined || window === null
          ? "기간 전체"
          : `최근 ${window}개 봉`;
      return `${base} · ${periodDays}일 · ${RESOLUTION_LABEL(
        resolution
      )} · ${winLabel}`;
    }
    if (key === "rsi" && configs.rsi) {
      const { resolution, period } = configs.rsi;
      return `${base} · ${period}d · ${RESOLUTION_LABEL(resolution)}`;
    }
    return base;
  };
  // console.log("💡 indicators", indicators);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 items-stretch">
        {indicators &&
          EXTENDED_FIELDS.map((f) => {
            const val = f.getValue(indicators);
            if (val === null) return null;
            const sub =
              "getSub" in f && typeof f.getSub === "function"
                ? f.getSub(indicators)
                : undefined;

            const label = labelWithConfig(f.key, f.label);

            return (
              <button
                key={f.key}
                type="button"
                className="cursor-pointer h-full min-h-[110px]"
                onClick={() => onSelectIndicator?.(f.key)}
              >
                <MetricCard
                  label={label}
                  value={val}
                  sub={sub}
                  cardKey={f.key}
                />
              </button>
            );
          })}
      </div>
    </div>
  );
}
