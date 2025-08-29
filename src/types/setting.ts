export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'error' | 'success'
}

export interface Settings {
  defaultPeriod: number
  refreshInterval: number
  dataSource: 'index' | 'mark' | 'last'
  alertThreshold: number
}