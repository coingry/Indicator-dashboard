// lib/metric/sigma.ts
import type { BTCData } from "@/types";

/**
 * 최근 window개의 로그수익률로 표준편차(σ, 비율)를 계산.
 * data는 과거→현재 오름차순이라 가정.
 */
export function computeSigma(data: BTCData[], window?: number): number {
  const nReturns = data.length - 1; // 전체 로그수익률 개수

  if (nReturns < 1) {
    throw new Error("표준편차 계산에는 최소 2개 봉이 필요합니다.");
  }

  // window=undefined면 전체 구간을 사용
  const effectiveWindow = window ?? nReturns;

  if (effectiveWindow < 1) {
    throw new Error(`window=${effectiveWindow}가 유효하지 않습니다.`);
  }

  const tail = data.slice(-(effectiveWindow + 1));
  const logReturns: number[] = [];

  for (let i = 1; i < tail.length; i++) {
    const r = Math.log(tail[i].close / tail[i - 1].close);
    logReturns.push(r);
  }

  const mean =
    logReturns.reduce((sum, x) => sum + x, 0) / logReturns.length;
  const variance =
    logReturns.reduce((s, x) => s + (x - mean) ** 2, 0) / (logReturns.length - 1);

  return Math.sqrt(variance);
}
