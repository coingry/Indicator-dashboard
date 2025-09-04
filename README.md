# 📊 BTC 지표 관리자 대시보드

Next.js 15와 Supabase를 기반으로 한 BTC(비트코인) 지표 관리 웹페이지입니다.

## 🚀 주요 기능
(추후 변경 가능)
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
- **소켓**: Socket.IO (실시간 데이터 스트리밍)

## 📋 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Binance API 설정
NEXT_PUBLIC_BINANCE_API_KEY=
NEXT_PUBLIC_BINANCE_SECRET_KEY=
# BINANCE_STREAM_URL=

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TABLE_NAME=
SUPABASE_SERVICE_ROLE_KEY=

# 기타 설정
NEXT_PUBLIC_BINANCE_STREAM_HOST=
NEXT_PUBLIC_SYMBOL=
NEXT_PUBLIC_FAPI_BASE=
NEXT_PUBLIC_SOCKET_URL=
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-schema.sql` 파일의 내용을 SQL 편집기에서 실행
3. 프로젝트 URL과 anon key를 환경변수에 설정

### 4. 개발 서버 실행

```bash
npm run dev:all
```

## 🏗️ 프로젝트 구조

```
src/
├── app/
│   ├── api/                      # API 라우트
│   │   └── btc-data/             # BTC 데이터 API
|   |   └── init/                 # 초기 데이터 API
│   ├── chart/                    # 차트 메인 대시보드 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 항목 선택 페이지
├── components/
│   ├── chart/                    # chart 컴포넌트 폴더
│   │   └── BTCchart.tsx          # BTC 차트 패널
|   |   └── ResolutionPicker.tsx
│   ├── metric/                   # 지표 컴포넌트 폴더
│   │   └── IndicatorsPanel.tsx
|   |   └── MetricCard.tsx
│   ├── LogPanel.tsx              # 로그 패널
│   └── SettingsPanel.tsx         # 설정 패널
├── hooks/                        # 훅
│   ├── useBTCWebSocket.ts
│   └── useLivePrice.ts
├── lib/                          # 라이브러리 폴더
│   ├── api/                    
│   ├── metric/
│   ├── socket/
│   └── supabase/
├── utils/                        # 유틸함수 폴더
│   ├── aggregation.ts                   
│   ├── chartOptions.ts
│   ├── config.ts
│   └── formatter.ts
│   └── index.ts
│   └── time.ts
├── types/                        # TypeScript 타입 정의
│    └── index.ts
│    └── indicators.ts
server/                           # 실시간 웹소켓 서버
├── socket-server.ts
ingest-worker/
     └── binance-worker.ts        # 실시간 바이낸스 데이터
```
