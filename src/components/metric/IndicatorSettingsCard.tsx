// components/IndicatorSettingsCard.tsx
import { IndicatorConfigs, DEFAULT_CONFIGS } from "@/utils";
import { IndicatorSettingsUI } from "@/lib";
import type { FieldKey } from "@/types";

type Props = {
  keyName: FieldKey;
  configs: IndicatorConfigs;
  onChange: (next: IndicatorConfigs) => void;
  onRemove: (key: FieldKey) => void;
};

export default function IndicatorSettingsCard({
  keyName,
  configs,
  onChange,
  onRemove,
}: Props) {
  const settingUI = IndicatorSettingsUI[keyName]?.({
    value: configs,
    onChange,
  });

  return (
    <div className="flex flex-col justify-between bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{keyName.toUpperCase()}</h4>
        <button
          onClick={() => onRemove(keyName)}
          className="cursor-pointer px-2 py-1 text-sm border rounded bg-red-500 text-white font-semibold"
        >
          제거
        </button>
      </div>

      {settingUI ?? (
        <div className="text-gray-500">이 지표는 별도 설정이 없습니다.</div>
      )}

      {keyName === "rsi" && (
        <div className="mt-3 text-right">
          <button
            className="cursor-pointer px-3 py-1 text-sm rounded font-semibold bg-black text-white"
            onClick={() =>
              onChange({
                ...configs,
                rsi: DEFAULT_CONFIGS.rsi,
              })
            }
          >
            RSI 기본값
          </button>
        </div>
      )}
      {keyName === "sigma" && (
        <div className="mt-3 text-right">
          <button
            className="cursor-pointer px-3 py-1 text-sm rounded font-semibold bg-black text-white"
            onClick={() =>
              onChange({
                ...configs,
                sigma: DEFAULT_CONFIGS.sigma,
              })
            }
          >
            σ 기본값
          </button>
        </div>
      )}
    </div>
  );
}
