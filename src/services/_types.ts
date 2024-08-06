import type { UseDispose } from 'zeed'
import { Emitter } from 'zeed'

export const trendSymbols: Record<string, string> = {
  '3': '↑↑',
  '2': '↑',
  '1': '↗︎',
  '0': '→',
  '-1': '↘︎',
  '-2': '↓',
  '-3': '↓↓',
}

export interface HealthDataPoint {
  ts: number
  value: number
  trend: number
  personId: number
}

export type HealtEventType = 'food' | 'insulin' | 'note'

export interface HealthEvent {
  id: number
  type: HealtEventType
  text: string
  ts: number
  personId: number
}

export interface HealthUpdateData {
  points: HealthDataPoint[]
  events: HealthEvent[]
}

export interface HealthPerson {
  id: number
  title: string
  uid: string

  service: 'dexcom' | 'freestyle'
  monitor: boolean

  // todo
  username: string
  password?: string
  location?: string

  //
  limitVeryHigh: number
  limitHigh: number
  limitLow: number
  limitVeryLow: number

}

export interface HealthEmitter {
  didUpdate: (personId: number) => void
}

export interface ServiceConnection {
  dispose: UseDispose
  updateOnce: () => Promise<void>
}

export const emitter = new Emitter<HealthEmitter>()
