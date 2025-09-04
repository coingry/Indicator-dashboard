// lib/metric/sigma.ts - 1분봉도 설정에 추가
import type { BTCData } from "@/types";

export function computeSigma(data: BTCData[]): number {
  if (data.length < 2) {
    throw new Error(
      "표준편차 계산을 위해서는 최소 2개 이상의 데이터가 필요합니다."
    );
  }

  // 로그 수익률 계산: ln(close_price / previous_close_price)
  const logReturns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const logReturn = Math.log(data[i].close / data[i - 1].close);
    logReturns.push(logReturn);
  }

  // 평균 계산
  const mean =
    logReturns.reduce((sum, ret) => sum + ret, 0) / logReturns.length;

  // 분산 계산
  const variance =
    logReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) /
    logReturns.length;

  // 표준편차 = √분산
  return Math.sqrt(variance);
}
