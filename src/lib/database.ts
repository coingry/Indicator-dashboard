import { supabase } from './supabase/client'
import { BTCData, IndicatorData, LogEntry } from '@/types'

/**
 * BTC 가격 데이터를 Supabase에 저장
 */
export async function saveBTCData(data: BTCData[]): Promise<void> {
  try {
    if (data.length === 0) return

    // 데이터 변환 (Supabase 스키마에 맞춤)
    const records = data.map(item => ({
      timestamp: new Date(item.timestamp).toISOString(),
      open_price: item.open,
      high_price: item.high,
      low_price: item.low,
      close_price: item.close,
      volume: item.volume,
      data_source: 'index'
    }))

    const { error } = await supabase
      .from('btc_chart_data')
      .upsert(records, {
        onConflict: 'timestamp',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('BTC 데이터 저장 오류:', error)
      throw new Error(`BTC 데이터 저장 실패: ${error.message}`)
    }

    console.log(`${records.length}개의 BTC 데이터 저장 완료`)
  } catch (error) {
    console.error('BTC 데이터 저장 중 오류:', error)
    throw error
  }
}

/**
 * 지표 데이터를 Supabase에 저장
 */
export async function saveIndicatorData(indicators: IndicatorData): Promise<void> {
  try {
    const record = {
      period_days: indicators.period,
      current_price: indicators.currentPrice,
      sigma: indicators.sigma / 100,
      sigma_absolute: indicators.sigmaAbsolute,
      upper_band: indicators.upperBand,
      lower_band: indicators.lowerBand,
      calculated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('indicator_data')
      .insert(record)

    if (error) {
      console.error('지표 데이터 저장 오류:', error)
      throw new Error(`지표 데이터 저장 실패: ${error.message}`)
    }

    console.log('지표 데이터 저장 완료')
  } catch (error) {
    console.error('지표 데이터 저장 중 오류:', error)
    throw error
  }
}

/**
 * 활동 로그를 Supabase에 저장
 */
export async function saveActivityLog(log: Omit<LogEntry, 'id'>): Promise<void> {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        timestamp: log.timestamp,
        message: log.message,
        type: log.type
      })

    if (error) {
      console.error('활동 로그 저장 오류:', error)
      throw new Error(`활동 로그 저장 실패: ${error.message}`)
    }
  } catch (error) {
    console.error('활동 로그 저장 중 오류:', error)
    throw error
  }
}

/*
 * 최근 BTC 데이터 조회
 */
export async function getRecentBTCData(limit: number = 1000): Promise<BTCData[]> {
  try {
    const { data, error } = await supabase
      .from('btc_chart_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('BTC 데이터 조회 오류:', error)
      throw new Error(`BTC 데이터 조회 실패: ${error.message}`)
    }

    // Supabase 데이터를 BTCData 형식으로 변환
    return data.map(item => ({
      timestamp: new Date(item.timestamp).getTime(),
      open: item.open_price,
      high: item.high_price,
      low: item.low_price,
      close: item.close_price,
      volume: item.volume
    })).reverse() // 시간순 정렬

  } catch (error) {
    console.error('BTC 데이터 조회 중 오류:', error)
    throw error
  }
}

/**
 * 최근 지표 데이터 조회
 */
export async function getRecentIndicators(limit: number = 100): Promise<IndicatorData[]> {
  try {
    const { data, error } = await supabase
      .from('indicator_data')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('지표 데이터 조회 오류:', error)
      throw new Error(`지표 데이터 조회 실패: ${error.message}`)
    }

    // Supabase 데이터를 IndicatorData 형식으로 변환
    return data.map(item => ({
      currentPrice: item.current_price,
      sigma: item.sigma * 100, // 소수를 퍼센트로 변환
      sigmaAbsolute: item.sigma_absolute,
      upperBand: item.upper_band,
      lowerBand: item.lower_band,
      period: item.period_days,
      lastUpdated: item.calculated_at
    }))

  } catch (error) {
    console.error('지표 데이터 조회 중 오류:', error)
    throw error
  }
}

/**
 * 활동 로그 조회
 */
export async function getActivityLogs(limit: number = 100): Promise<LogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('활동 로그 조회 오류:', error)
      throw new Error(`활동 로그 조회 실패: ${error.message}`)
    }

    return data.map(item => ({
      id: item.id,
      timestamp: item.timestamp,
      message: item.message,
      type: item.type
    }))

  } catch (error) {
    console.error('활동 로그 조회 중 오류:', error)
    throw error
  }
}
