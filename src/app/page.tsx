// app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [initStatus, setInitStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInitClick = async () => {
    setLoading(true)
    setInitStatus('📡 6개월치 데이터 수집 중... 잠시만 기다려주세요.')
    try {
      const res = await fetch('/api/init')
      const json = await res.json()
      if (json.success) {
        setInitStatus(`✅ ${json.inserted}건 데이터가 삽입되었습니다.`)
      } else {
        setInitStatus(`❌ 에러 발생: ${json.error}`)
      }
    } catch (e) {
      setInitStatus(`❌ 예기치 못한 오류: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          📊 BTC 지표 관리자 대시보드
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleInitClick}
            disabled={loading}
            className="w-full border-1 border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white hover:font-semibold py-2 px-4 rounded"
          >
            ① 6개월치 데이터 가져오기
          </button>

          <button
            onClick={() => alert('실시간 수집은 아직 구현되지 않았습니다.')}
            className="w-full border-1 border-yellow-600 text-yellow-600 bg-white hover:bg-yellow-600 hover:text-white hover:font-semibold py-2 px-4 rounded"
          >
            ② 실시간 데이터 수집 시작 (준비 중)
          </button>

          <button
            onClick={() => router.push('/chart')}
            className="w-full border-1 border-green-700 text-green-700 bg-white hover:bg-green-700 hover:text-white hover:font-semibold py-2 px-4 rounded"
          >
            ③ 지표 페이지로 이동
          </button>

          {initStatus && (
            <p className="text-sm text-center text-gray-700 mt-2 whitespace-pre-line">{initStatus}</p>
          )}
        </div>
      </div>
    </main>
  )
}
