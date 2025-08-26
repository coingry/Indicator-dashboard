'use client'

import { useState } from 'react'
import { Settings } from '@/types'

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    defaultPeriod: 30,
    refreshInterval: 60,
    dataSource: 'index',
    alertThreshold: 0.05
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = () => {
    // 실제 구현에서는 API를 통해 설정을 저장
    console.log('설정 저장:', settings)
    setIsEditing(false)
    // 성공 메시지 표시
    alert('설정이 저장되었습니다.')
  }

  const resetSettings = () => {
    setSettings({
      defaultPeriod: 30,
      refreshInterval: 60,
      dataSource: 'index',
      alertThreshold: 0.05
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* 설정 모드 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">설정 편집</span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            isEditing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isEditing ? '💾 편집 완료' : '✏️ 편집'}
        </button>
      </div>

      {/* 기본 기간 설정 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          기본 계산 기간
        </label>
        <select
          value={settings.defaultPeriod}
          onChange={(e) => handleSettingChange('defaultPeriod', Number(e.target.value))}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value={30}>30일</option>
          <option value={60}>60일</option>
          <option value={90}>90일</option>
        </select>
      </div>

      {/* 새로고침 주기 설정 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          자동 새로고침 주기 (초)
        </label>
        <select
          value={settings.refreshInterval}
          onChange={(e) => handleSettingChange('refreshInterval', Number(e.target.value))}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value={30}>30초</option>
          <option value={60}>1분</option>
          <option value={300}>5분</option>
          <option value={600}>10분</option>
        </select>
      </div>

      {/* 데이터 소스 설정 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          데이터 소스 타입
        </label>
        <select
          value={settings.dataSource}
          onChange={(e) => handleSettingChange('dataSource', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="index">Index Price</option>
          <option value="mark">Mark Price</option>
          <option value="last">Last Price</option>
        </select>
      </div>

      {/* 알림 임계치 설정 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          알림 임계치 (σ)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={settings.alertThreshold}
          onChange={(e) => handleSettingChange('alertThreshold', Number(e.target.value))}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="0.05"
        />
        <p className="text-xs text-gray-500">
          σ 값이 이 임계치를 초과할 때 알림을 받습니다.
        </p>
      </div>

      {/* 액션 버튼들 */}
      {isEditing && (
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={saveSettings}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            💾 저장
          </button>
          <button
            onClick={resetSettings}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            🔄 초기화
          </button>
        </div>
      )}

      {/* 현재 설정 요약 */}
      {!isEditing && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">현재 설정 요약</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>기본 기간: {settings.defaultPeriod}일</p>
            <p>새로고침: {settings.refreshInterval}초</p>
            <p>데이터 소스: {settings.dataSource}</p>
            <p>알림 임계치: {settings.alertThreshold}</p>
          </div>
        </div>
      )}
    </div>
  )
}
