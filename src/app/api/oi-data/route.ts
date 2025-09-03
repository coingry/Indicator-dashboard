// api/oi-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { FAPI_BASE, SYMBOL, OI_RAW_MIN, OI_STALE_MAX_MIN } from '@/utils'
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
    const lastTs = Number(sorted[1].timestamp)

    if (!prev || !curr || prev === 0) {
      return NextResponse.json({ success: false, error: 'Invalid OI data' }, { status: 500 })
    }

    const delta = ((curr - prev) / prev) * 100
    const cleaned = Math.abs(delta) < OI_RAW_MIN ? 0.0 : parseFloat(delta.toFixed(2))

    const lagMin = (Date.now() - lastTs) / 60000
    if (lagMin > OI_STALE_MAX_MIN) {
      return NextResponse.json({ success: false, error: `Stale OI data (${lagMin.toFixed(1)}m old)` }, { status: 504 })
    }

    const { data: priceData, error: priceError } = await supabase
      .from('btc_chart_data')
      .select('close, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)

    if (priceError || !priceData || priceData.length === 0) {
      return NextResponse.json({ success: false, error: 'Failed to fetch price data' }, { status: 500 })
    }

    const { close: latestClose, timestamp: priceTimestamp } = priceData[0]
    const priceLagMin = (Date.now() / 1000 - priceTimestamp) / 60

    if (priceLagMin > 3) {
      return NextResponse.json({ success: false, error: `Stale price data (${priceLagMin.toFixed(1)}m old)` }, { status: 504 })
    }

    return NextResponse.json({
      success: true,
      oiDelta: cleaned,
      prev,
      curr,
      timestamp: lastTs,
      price: latestClose,
      priceTimestamp,
    })

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error('OI API Error:', e)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
