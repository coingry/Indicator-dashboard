# 📊 BTC 지표 관리자 대시보드

Next.js 15와 Supabase를 기반으로 한 BTC(비트코인) 지표 관리 웹페이지입니다.

## 🚀 주요 기능

- **실시간 BTC 차트**: lightweight-charts를 사용한 1분봉 차트
- **지표 계산**: σ(표준편차), ±1σ 밴드 등 통계 지표
- **기간별 분석**: 30일, 60일, 90일 기간 선택 가능
- **활동 로그**: 지표 계산 및 시스템 활동 기록
- **관리자 설정**: 새로고침 주기, 데이터 소스, 알림 임계치 등

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 15 (App Router), React, TypeScript
- **스타일링**: Tailwind CSS
- **차트**: lightweight-charts
- **상태 관리**: @tanstack/react-query
- **백엔드**: Next.js API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **API**: Binance Futures API

## 📋 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Binance API 설정
NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key_here
NEXT_PUBLIC_BINANCE_SECRET_KEY=your_binance_secret_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 기타 설정
NEXT_PUBLIC_SYMBOL=BTCUSDT
NEXT_PUBLIC_FAPI_BASE=https://fapi.binance.com
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-schema.sql` 파일의 내용을 SQL 편집기에서 실행
3. 프로젝트 URL과 anon key를 환경변수에 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── btc-data/      # BTC 데이터 API
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 대시보드
├── components/             # React 컴포넌트
│   ├── BTCChart.tsx       # BTC 차트
│   ├── IndicatorsPanel.tsx # 지표 패널
│   ├── LogPanel.tsx       # 로그 패널
│   └── SettingsPanel.tsx  # 설정 패널
├── lib/                    # 유틸리티
│   └── supabase.ts        # Supabase 클라이언트
└── types/                  # TypeScript 타입 정의
    └── index.ts
```

## 📊 지표 계산 방법

### σ (표준편차) 계산

1. **로그 수익률 계산**: `ln(close_price / previous_close_price)`
2. **평균 계산**: 모든 로그 수익률의 평균
3. **분산 계산**: 각 로그 수익률과 평균의 차이 제곱의 평균
4. **표준편차**: 분산의 제곱근

### ±1σ 밴드

- **상단 밴드**: `현재가 + (현재가 × σ)`
- **하단 밴드**: `현재가 - (현재가 × σ)`

## 🔧 API 엔드포인트

### GET /api/btc-data

BTC 데이터와 지표를 가져오는 API

**쿼리 파라미터:**
- `period`: 계산 기간 (30, 60, 90일)

**응답:**
```json
{
  "success": true,
  "data": {
    "chartData": [...],
    "indicators": {
      "currentPrice": 50000,
      "sigma": 0.0235,
      "sigmaAbsolute": 1175,
      "upperBand": 51175,
      "lowerBand": 48825,
      "period": 30,
      "lastUpdated": "2025-01-21T00:00:00.000Z"
    }
  }
}
```

## 🚧 향후 개발 계획

- [ ] Binance API 실제 연동
- [ ] 실시간 데이터 스트리밍
- [ ] 알림 시스템 구현
- [ ] 사용자 인증 및 권한 관리
- [ ] 지표 히스토리 차트
- [ ] 백테스팅 기능

## 📝 라이선스

MIT License

## 🤝 기여

이슈나 풀 리퀘스트를 통해 기여해주세요!
