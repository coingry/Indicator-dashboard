// components/chart/ResolutionPicker.tsx
"use client";

import { CANDLE_LABELS, RESOLUTION_ORDER} from '@/utils'
import { Resolution } from '@/types';

type Props = {
  value: Resolution;
  onChange: (r: Resolution) => void;
};

export default function ResolutionPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {RESOLUTION_ORDER.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={[
            "px-3 py-1 rounded text-sm transition cursor-pointer",
            value === r
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800",
          ].join(" ")}
          aria-pressed={value === r}
          type="button"
        >
          {CANDLE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}
