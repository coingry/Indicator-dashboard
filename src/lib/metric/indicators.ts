// lib/indicators.ts
import { BTCData, IndicatorData } from '@/types'

// OI 관련 상수 (파이썬 코드와 동일)
export const OI_RAW_MIN = 0.05
export const OI_DISPLAY_MIN = 0.30
export const OI_OPEN_STRONG = 0.80
export const OI_CLOSE_STRONG = -0.50
export const NEAR_BAND = 0.3

/**
 * σ 기반 지표 계산
 * 파이썬 코드의 check_sigma 함수와 동일한 로직
 */
export function calculateIndicators(
  data: BTCData[], 
  period: number,
  sigma: number
): IndicatorData {
  if (data.length === 0) {
    throw new Error('데이터가 비어있습니다.')
  }

  const currentPrice = data[data.length - 1].close
  const prevClose = data[0].close // 기간 시작점의 종가

  // σ 정보를 다양한 형태로 계산
  const sigmaPercent = sigma * 100
  const sigmaAbsolute = prevClose * sigma

  // ±1σ, ±2σ, ±3σ 밴드 계산
  const upper1 = prevClose + sigmaAbsolute
  const lower1 = prevClose - sigmaAbsolute
  const upper2 = prevClose + 2 * sigmaAbsolute
  const lower2 = prevClose - 2 * sigmaAbsolute
  const upper3 = prevClose + 3 * sigmaAbsolute
  const lower3 = prevClose - 3 * sigmaAbsolute

  // 돌파 배수 계산 (분모가 0이 아닐 때만)
  const multiple = sigmaAbsolute !== 0 ? (currentPrice - prevClose) / sigmaAbsolute : null

  // 돌파 여부 확인
  const alert = currentPrice > upper1 || currentPrice < lower1

  return {
    sigma: sigmaPercent,
    sigmaAbsolute,
    upperBand: upper1,
    lowerBand: lower1,
    period,
    lastUpdated: new Date().toISOString(),
    // 추가 지표들
    upper2,
    lower2,
    upper3,
    lower3,
    multiple,
    alert,
    prevClose
  }
}

/**
 * OI 변화율 기반 포지션 분석
 * 파이썬 코드의 snapshot_comment_from 함수와 유사한 로직
 */
export function analyzePosition(
  price: number,
  upper: number,
  lower: number,
  oiDelta: number | null
): {
  nearUpper: boolean
  nearLower: boolean
  bias: number
  position: string
} {
  const sigmaAbs = (upper - lower) / 2
  const mid = (upper + lower) / 2
  const bias = price - mid

  // 밴드 근접성 확인
  const nearUpper = sigmaAbs ? (upper - price) / sigmaAbs <= NEAR_BAND : false
  const nearLower = sigmaAbs ? (price - lower) / sigmaAbs <= NEAR_BAND : false

  // 포지션 분석
  let position = '중립 구간 | 관망'

  if (nearUpper) {
    if (oiDelta !== null && oiDelta >= OI_OPEN_STRONG) {
      position = '상방 대기 | 롱 신규 유입'
    } else if (oiDelta !== null && oiDelta <= OI_CLOSE_STRONG) {
      position = '상방 대기 | 숏 정리 주도(지속성↓)'
    } else {
      position = '상방 대기 | 관망'
    }
  } else if (nearLower) {
    if (oiDelta !== null && oiDelta >= OI_OPEN_STRONG) {
      position = '하방 대기 | 숏 신규 유입'
    } else if (oiDelta !== null && oiDelta <= OI_CLOSE_STRONG) {
      position = '하방 대기 | 롱 정리 주도(반등 가능)'
    } else {
      position = '하방 대기 | 관망'
    }
  } else {
    // 중앙 구간
    if (oiDelta === null || Math.abs(oiDelta) < OI_DISPLAY_MIN) {
      position = '중앙 구간 | 관망'
    } else if (oiDelta > 0) {
      position = bias >= 0 ? '중앙 구간 | 롱 축적' : '중앙 구간 | 숏 축적'
    } else {
      position = bias >= 0 ? '중앙 구간 | 롱 정리' : '중앙 구간 | 숏 정리'
    }
  }

  return {
    nearUpper,
    nearLower,
    bias,
    position
  }
}

/**
 * 변동률 계산
 */
export function calculateChangePercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current / previous) - 1) * 100
}

/**
 * 시간대별 변동률 계산 (1시간, 4시간, 1일)
 */
export function calculateTimeBasedChanges(data: BTCData[], prevClose: number): {
  delta1H: number | null
  delta4H: number | null
  delta1D: number | null
} {
  if (data.length === 0) {
    return { delta1H: null, delta4H: null, delta1D: null }
  }

  const currentPrice = data[data.length - 1].close
  const now = new Date(data[data.length - 1].timestamp)
  
  // 1시간 전, 4시간 전 시점 찾기
  const oneHourAgo = now.getTime() - 60 * 60 * 1000
  const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000

  // 해당 시점 이전의 가장 가까운 종가 찾기
  const findCloseBefore = (targetTime: number): number | null => {
    const beforeData = data.filter(d => d.timestamp <= targetTime)
    return beforeData.length > 0 ? beforeData[beforeData.length - 1].close : null
  }

  const close1H = findCloseBefore(oneHourAgo)
  const close4H = findCloseBefore(fourHoursAgo)

  return {
    delta1H: close1H ? calculateChangePercent(currentPrice, close1H) : null,
    delta4H: close4H ? calculateChangePercent(currentPrice, close4H) : null,
    delta1D: calculateChangePercent(currentPrice, prevClose)
  }
}
