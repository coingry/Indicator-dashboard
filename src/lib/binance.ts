import { BTCData } from '@/types'

// 환경변수에서 설정 가져오기
const BINANCE_API_KEY = process.env.NEXT_PUBLIC_BINANCE_API_KEY!
const BINANCE_SECRET_KEY = process.env.NEXT_PUBLIC_BINANCE_SECRET_KEY!
const SYMBOL = process.env.NEXT_PUBLIC_SYMBOL || 'BTCUSDT'
const FAPI_BASE = process.env.NEXT_PUBLIC_FAPI_BASE || 'https://fapi.binance.com'

/**
 * Binance Futures Index Price Klines 데이터 가져오기
 * 파이썬 코드의 fetch_intraday_btc 함수와 동일한 로직
 */
export async function fetchIntradayBTC(days: number = 1): Promise<BTCData[]> {
  try {
    const allData: BTCData[] = []
    const limit = 200
    const periods = Math.ceil(days * 24 * 60 / limit)
    let endTime: number | undefined = undefined

    // 여러 번의 API 호출로 필요한 데이터 수집
    for (let i = 0; i < periods; i++) {
      const params: Record<string, string> = {
        pair: SYMBOL,
        interval: '1m',
        limit: String(limit)
      }

      if (endTime) {
        params.endTime = String(endTime)
      }

      const url = `${FAPI_BASE}/fapi/v1/indexPriceKlines`
      const queryString = new URLSearchParams(params as Record<string, string>).toString()
      const fullUrl = `${url}?${queryString}`

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': BINANCE_API_KEY
        }
      })

      if (!response.ok) {
        throw new Error(`Binance API 오류: ${response.status} ${response.statusText}`)
      }

      const klines = await response.json()

      if (!klines || klines.length === 0) {
        break
      }

      // 데이터 변환 및 추가
      const convertedData: BTCData[] = klines.map((kline: (string | number)[]) => ({
        timestamp: parseInt(String(kline[0])),
        open: parseFloat(String(kline[1])),
        high: parseFloat(String(kline[2])),
        low: parseFloat(String(kline[3])),
        close: parseFloat(String(kline[4])),
        volume: parseFloat(String(kline[5]))
      }))

      allData.push(...convertedData)

      // 다음 요청을 위한 endTime 설정
      if (convertedData.length > 0) {
        endTime = convertedData[0].timestamp - 1
      }

      // API 제한 방지를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // 중복 제거 및 시간순 정렬
    const uniqueData = allData
      .filter((data, index, self) => 
        index === self.findIndex(d => d.timestamp === data.timestamp)
      )
      .sort((a, b) => a.timestamp - b.timestamp)

    return uniqueData

  } catch (error) {
    console.error('Binance API 호출 오류:', error)
    throw new Error(`바이낸스 데이터를 가져오는데 실패했습니다: ${error}`)
  }
}

/**
 * Binance Futures Index Price 일봉 데이터 가져오기
 * 파이썬 코드의 daily_job 함수와 동일한 로직
 */
export async function fetchDailyBTC(days: number = 30): Promise<BTCData[]> {
  try {
    const url = `${FAPI_BASE}/fapi/v1/indexPriceKlines`
    const params = {
      pair: SYMBOL,
      interval: '1d',
      limit: String(days + 1) // 미종가 제외를 위해 +1
    }

    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${url}?${queryString}`

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': BINANCE_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`Binance API 오류: ${response.status} ${response.statusText}`)
    }

    const klines = await response.json()

    if (!klines || klines.length === 0) {
      throw new Error('일봉 데이터가 없습니다.')
    }

    // 데이터 변환
    const convertedData: BTCData[] = klines.map((kline: (string | number)[]) => ({
      timestamp: parseInt(String(kline[0])),
      open: parseFloat(String(kline[1])),
      high: parseFloat(String(kline[2])),
      low: parseFloat(String(kline[3])),
      close: parseFloat(String(kline[4])),
      volume: parseFloat(String(kline[5]))
    }))

    // 진행 중인 최신 일봉 제거 (항상 마지막 1개 제거)
    if (convertedData.length >= 2) {
      return convertedData.slice(0, -1).slice(-days)
    }

    return convertedData.slice(-days)

  } catch (error) {
    console.error('Binance 일봉 API 호출 오류:', error)
    throw new Error(`바이낸스 일봉 데이터를 가져오는데 실패했습니다: ${error}`)
  }
}

/**
 * 현재 BTC 가격 가져오기
 */
export async function getCurrentBTCPrice(): Promise<number> {
  try {
    const url = `${FAPI_BASE}/fapi/v1/indexPriceKlines`
    const params = {
      pair: SYMBOL,
      interval: '1m',
      limit: '1'
    }

    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${url}?${queryString}`

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': BINANCE_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`Binance API 오류: ${response.status} ${response.statusText}`)
    }

    const klines = await response.json()

    if (!klines || klines.length === 0) {
      throw new Error('현재 가격 데이터가 없습니다.')
    }

    return parseFloat(klines[0][4]) // Close price

  } catch (error) {
    console.error('현재 BTC 가격 조회 오류:', error)
    throw new Error(`현재 BTC 가격을 가져오는데 실패했습니다: ${error}`)
  }
}

/**
 * OI(미결제약정) 5분 히스토리 2점으로 Δ% 계산
 * 파이썬 코드의 fetch_oi_delta_pct_5m 함수와 동일한 로직
 */
export async function fetchOIDeltaPct5m(symbol: string = SYMBOL): Promise<number | null> {
  try {
    // 1) 최신 5분 경계(UTC)로 endTime 고정
    const now = new Date()
    const nowUtc = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    const endMs = Math.floor(nowUtc.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)

    const url = `${FAPI_BASE}/futures/data/openInterestHist`
    const params = {
      symbol: symbol,
      contractType: 'PERPETUAL',
      period: '5m',
      limit: '2',
      endTime: String(endMs)
    }

    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${url}?${queryString}`

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': BINANCE_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`OI API 오류: ${response.status} ${response.statusText}`)
    }

    const items = await response.json()

    if (!Array.isArray(items) || items.length < 2) {
      return null
    }

    // 2) 안전: 타임스탬프 오름차순 정렬
    try {
      items.sort((a, b) => parseInt(a.timestamp || 0) - parseInt(b.timestamp || 0))
    } catch (error) {
      console.warn('OI 데이터 정렬 실패:', error)
    }

    // 2.5) 신선도 가드: 가장 최근 포인트가 현재 5분경계 대비 너무 오래됐으면 스킵
    try {
      const lastTsMs = parseInt(items[items.length - 1].timestamp || 0)
      const lastDtUtc = new Date(lastTsMs)
      const lagMin = (nowUtc.getTime() - lastDtUtc.getTime()) / (60 * 1000)
      
      if (lagMin > 10) { // 10분 이상 지연되면 스킵
        console.warn(`OI(5m) data stale by ${lagMin.toFixed(1)} min; skipping.`)
        return null
      }
    } catch (error) {
      console.warn('OI 신선도 확인 실패:', error)
    }

    // 3) 값 선택(수량 우선 → 잔여)
    const pickQty = (d: Record<string, unknown>): number | null => {
      for (const k of ['sumOpenInterest', 'openInterest']) {
        if (k in d && typeof d[k] === 'string') {
          return parseFloat(d[k] as string)
        }
      }
      return null
    }

    const prev = pickQty(items[items.length - 2])
    const curr = pickQty(items[items.length - 1])

    if (!prev || !curr || prev === 0) {
      return null
    }

    const delta = ((curr - prev) / prev) * 100.0

    // 4) −0.0 제거(절대값 0.05% 미만은 0.0으로)
    if (Math.abs(delta) < 0.05) {
      return 0.0
    }

    // 5) 디버그 로그
    console.log(
      `OI(5m) ts=${items[items.length - 2].timestamp}→${items[items.length - 1].timestamp}, ` +
      `prev=${prev}, curr=${curr}, delta=${delta.toFixed(4)}%`
    )

    return delta

  } catch (error) {
    console.error(`fetch_oi_delta_pct_5m error: ${error}`)
    return null
  }
}

/**
 * API 키 유효성 검사
 */
export function validateBinanceConfig(): boolean {
  if (!BINANCE_API_KEY || !BINANCE_SECRET_KEY) {
    console.warn('Binance API 키가 설정되지 않았습니다.')
    return false
  }
  return true
}
