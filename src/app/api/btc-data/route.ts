// app/api/btc-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateIndicators, computeSigma } from "@/lib";
import { supabase } from "@/lib/supabase/server";
import type { BTCData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 페이지네이션 단위
const PAGE_SIZE = 1000;
// 증분 조회 시 안전 겹침(초) — 경계 중복 방지/보정용
const DEFAULT_OVERLAP_SEC = 300; // 5분

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 1) 초기 로드: period(days) 기반
  const periodDays = Number(searchParams.get("period") || "30");

  // 2) 증분 로드: since(초) 이후만
  const since = searchParams.get("since"); // string | null
  const overlapSec = Number(searchParams.get("overlap") || DEFAULT_OVERLAP_SEC);

  // 현재 시각(초)
  const nowSec = Math.floor(Date.now() / 1000);

  try {
    // ─────────────────────────────────────────
    // 증분 모드: ?since=timestamp
    // ─────────────────────────────────────────
    if (since) {
      const sinceSec = toIntSafe(since, "since");
      // 안전 겹침: since - overlap ~ now 구간을 받아서 클라에서 중복 제거 권장
      const from = Math.max(0, sinceSec - overlapSec);
      const to = nowSec;

      const btcData = await fetchRangeBTCData(from, to);

      return NextResponse.json(
        {
          success: true,
          mode: "incremental",
          data: {
            btcData,
            // indicators는 증분에서는 계산하지 않음(원한다면 서버에서 prevClose/sigma를 별도 캐시로 관리)
            lastUpdated: btcData.at(-1)?.timestamp ?? null,
          },
        },
        { headers: noStoreHeaders() }
      );
    }

    // ─────────────────────────────────────────
    // 초기/전체 모드: ?period=days
    // ─────────────────────────────────────────
    const from = nowSec - periodDays * 86400;
    const to = nowSec;

    const btcData = await fetchRangeBTCData(from, to);

    // computeSigma는 "일봉 종가" 시계열로 쓰는 게 정석이지만,
    // 현재 구조에선 period 구간의 연속 close로 계산 (기존 로직 유지)
    const sigma = computeSigma(btcData);
    const indicators = calculateIndicators(btcData, periodDays, sigma);

    return NextResponse.json(
      {
        success: true,
        mode: "full",
        data: {
          btcData,
          indicators,
        },
      },
      { headers: noStoreHeaders() }
    );
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * 주어진 초단위 구간[from, to]의 BTCData를 페이지네이션으로 모두 수집
 */
async function fetchRangeBTCData(from: number, to: number): Promise<BTCData[]> {
  const allRows: BTCData[] = [];
  let lastTs: number | null = null;

  while (true) {
    let query = supabase
      .from("btc_chart_data")
      .select("timestamp, open, high, low, close")
      .gte("timestamp", from)
      .lte("timestamp", to)
      .order("timestamp", { ascending: true })
      .limit(PAGE_SIZE);

    // 다음 페이지: 마지막 ts 초과
    if (lastTs !== null) {
      query = query.gt("timestamp", lastTs);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    if (!rows || rows.length === 0) break;

    for (const r of rows) {
      allRows.push({
        timestamp: r.timestamp,
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: 0,
      });
    }

    if (rows.length < PAGE_SIZE) break;
    lastTs = rows[rows.length - 1].timestamp;
  }

  return allRows;
}

function toIntSafe(val: string, name = "value"): number {
  const n = Number(val);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid ${name}: ${val}`);
  }
  return Math.floor(n);
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store",
  };
}
