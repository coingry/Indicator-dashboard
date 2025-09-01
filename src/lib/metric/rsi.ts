// lib/indicators/rsi.ts
import type { BTCData } from "@/types";
import { RSI_PERIOD } from "@/utils";

export function calculateRSI(data: BTCData[], period: number = RSI_PERIOD): number | null {
  if (data.length < period + 1) return null;

  const prices = data.map(d => d.close);
  const deltas = prices.slice(1).map((price, i) => price - prices[i]);

  const gains  = deltas.map(d => d > 0 ? d : 0);
  const losses = deltas.map(d => d < 0 ? -d : 0);

  let avgGain = gains.slice(0, period).reduce((s, g) => s + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, l) => s + l, 0) / period;

  for (let i = period; i < deltas.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;

  const rs  = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return rsi;
}
