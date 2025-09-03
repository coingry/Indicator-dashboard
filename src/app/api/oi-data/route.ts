// api/oi-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { FAPI_BASE, SYMBOL } from '@/utils'
import { supabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const nowUTC = new Date()
    nowUTC.setUTCMinutes(Math.floor(nowUTC.getUTCMinutes() / 5) * 5, 0, 0)
    const endTime = nowUTC.getTime()

    const url = `${FAPI_BASE}/futures/data/openInterestHist`
    const params = new URLSearchParams({
      symbol: SYMBOL,
      contractType: 'PERPETUAL',
      period: '5m',
      limit: '2',
      endTime: endTime.toString(),
    })

    const response = await fetch(`${url}?${params.toString()}`)
    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Binance API error' }, { status: 502 })
    }

    const data = await response.json()
    if (!Array.isArray(data) || data.length < 2) {
      return NextResponse.json({ success: false, error: 'Insufficient OI data' }, { status: 500 })
    }

    const sorted = data.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
    const prev = parseFloat(sorted[0]?.sumOpenInterest ?? sorted[0]?.openInterest)
    const curr = parseFloat(sorted[1]?.sumOpenInterest ?? sorted[1]?.openInterest)
    const lastTs = Number(sorted[1].timestamp) // ms

    if (!prev || !curr || prev === 0) {
      return NextResponse.json({ success: false, error: 'Invalid OI data' }, { status: 500 })
    }

    const oiDelta = parseFloat((((curr - prev) / prev) * 100).toFixed(2))

    const { data: priceData, error: priceError } = await supabase
      .from('btc_chart_data')
      .select('close, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)

    if (priceError || !priceData || priceData.length === 0) {
      return NextResponse.json({ success: false, error: 'Failed to fetch price data' }, { status: 500 })
    }

    const { close: latestClose, timestamp: priceTimestamp } = priceData[0]

    const t0 = Math.floor(lastTs / 1000)
    const t1 = t0 - 60

    const { data: windowRows, error: windowErr } = await supabase
      .from('btc_chart_data')
      .select('timestamp, close')
      .gte('timestamp', t1 - 60)
      .lte('timestamp', t0 + 60)
      .order('timestamp', { ascending: true })

    let price1mDelta: number | null = null
    if (!windowErr && windowRows && windowRows.length > 0) {
      const pickAtOrBefore = (targetSec: number) => {
        let picked: { timestamp: number; close: number } | null = null
        for (const r of windowRows) {
          if (r.timestamp <= targetSec) picked = r
          else break
        }
        return picked
      }

      const p0 = pickAtOrBefore(t0)
      const p1 = pickAtOrBefore(t1)

      if (p0 && p1 && p1.close) {
        price1mDelta = parseFloat((((p0.close - p1.close) / p1.close) * 100).toFixed(2))
      }
    }

    type Flow = 'New Long' | 'New Short' | 'Short Cover' | 'Long Cover' | 'Neutral'
    let flowSignal: Flow = 'Neutral'

    if (price1mDelta !== null) {
      if (oiDelta > 0 && price1mDelta > 0) flowSignal = 'New Long'
      else if (oiDelta > 0 && price1mDelta < 0) flowSignal = 'New Short'
      else if (oiDelta < 0 && price1mDelta > 0) flowSignal = 'Short Cover'
      else if (oiDelta < 0 && price1mDelta < 0) flowSignal = 'Long Cover'
    }

    return NextResponse.json({
      success: true,
      oiDelta,
      prev,
      curr,
      timestamp: lastTs,
      price: latestClose,
      priceTimestamp,
      price1mDelta,
      flowSignal,
    })
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error('OI API Error:', e)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
