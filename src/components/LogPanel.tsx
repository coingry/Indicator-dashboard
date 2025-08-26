'use client'

import { useState } from 'react'
import { LogEntry } from '@/types'

export default function LogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      message: '지표 계산 완료: 0.0235 (±2500 USD)',
      type: 'success'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      message: '데이터 캐시 갱신 완료',
      type: 'info'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      message: 'Binance API 연결 확인됨',
      type: 'info'
    }
  ])

  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getLogTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '📝'
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          총 {logs.length}개의 로그
        </div>
        <button
          onClick={clearLogs}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        >
          🗑️ 로그 지우기
        </button>
      </div>

      {/* 로그 목록 */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            로그가 없습니다.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border ${getLogTypeColor(log.type)}`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">{getLogTypeIcon(log.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{log.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(log.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 새 로그 추가 (테스트용) */}
      <div className="pt-4 border-t">
        <button
          onClick={() => {
            const newLog: LogEntry = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              message: `테스트 로그 - ${new Date().toLocaleTimeString()}`,
              type: 'info'
            }
            setLogs(prev => [newLog, ...prev])
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          📝 테스트 로그 추가
        </button>
      </div>
    </div>
  )
}
