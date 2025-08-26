// app/chart/page.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BTCChart,
  IndicatorsPanel,
  LogPanel,
  SettingsPanel,
  ResolutionPicker
} from "@/components";
import { Resolution } from "@/types";

const queryClient = new QueryClient();

export default function ChartPage() {
  const [resolution, setResolution] = useState<Resolution>("1m");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-10xl mx-auto flex flex-col gap-6">
          <div className="flex basis-[70%] gap-6">
            <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                BTC/USD
              </h2>
              <ResolutionPicker value={resolution} onChange={setResolution} />
              <BTCChart resolution={resolution} />
            </div>

            <div className="w-[30%] bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                지표 정보
              </h2>
              <IndicatorsPanel />
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
    </QueryClientProvider>
  );
}
