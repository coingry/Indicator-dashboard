// lib/indicators.ts
import { BTCData, IndicatorData } from '@/types'

export function calculateIndicators(
  data: BTCData[], 
  period: number,
  sigma: number
): IndicatorData {
  if (data.length === 0) {
    throw new Error('데이터가 비어있습니다.')
  }

  const currentPrice = data[data.length - 1].close
  const prevClose = data[0].close

  const sigmaPercent = sigma * 100
  const sigmaAbsolute = prevClose * sigma
  const upper1 = prevClose + sigmaAbsolute
  const lower1 = prevClose - sigmaAbsolute

  return {
    currentPrice,
    sigma: sigmaPercent,
    upperBand: upper1,
    lowerBand: lower1,
    period,
    lastUpdated: new Date().toISOString(),
  }
}