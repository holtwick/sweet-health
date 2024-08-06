import { on } from '@zerva/core'
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import type { SqliteTableDefault } from './db/sqlite'
import { useSqliteDatabase } from './db/sqlite'
// import type { GlucoseEntry, HealthDataPoint, HealthEvent, HealthUpdateData } from './_types'
import type { HealthDataPoint, HealthEvent, HealthPerson } from '@/services/_types'

const log: LoggerInterface = Logger('db')

export const db = useSqliteDatabase('./data/health.sqlite', {
  verbose: log,
  // log: 'info',
})

on('serveStop', db.dispose)

// Health Persons

export const tablePersons = db.table<HealthPerson>('persons', {
  title: 'string',
  service: 'string',
  monitor: 'boolean',
  uid: 'string',
  username: 'string',
  password: 'string',
  location: 'string',
  limitVeryHigh: 'float',
  limitHigh: 'float',
  limitLow: 'float',
  limitVeryLow: 'float',
})

// Health Points

export const tablePoints = db.table<HealthDataPoint>('points', {
  ts: 'integer',
  value: 'number',
  trend: 'integer',
  personId: 'integer',
})

tablePoints.indexUnique(['ts', 'personId'])

export function updatePoint(item: HealthDataPoint) {
  // log('update point', item)
  // tablePoints.insert(item)
  tablePoints.upsert(['ts', 'personId'], item)
}

// Health Events

export interface TableEvents extends SqliteTableDefault, HealthEvent {}

export const tableEvents = db.table<TableEvents>('events', {
  ts: 'integer',
  type: 'string',
  text: 'string',
  personId: 'integer',
})

tableEvents.indexUnique(['ts', 'personId'])

// Functions

export function getLatestEntry(personId: number): HealthDataPoint | undefined {
  return tablePoints.query(`SELECT * FROM ${tablePoints.name} WHERE personId=? ORDER BY ts DESC LIMIT 1`, personId)[0]
}
