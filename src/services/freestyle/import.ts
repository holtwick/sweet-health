import type { LoggerInterface } from 'zeed'
import { Logger, csvParse } from 'zeed'
import type { HealthDataPoint, HealthEvent, HealthUpdateData } from '@/services/_types'

const log: LoggerInterface = Logger('import')

enum FreestyleCsvColumns {
  title,
  serialno,
  datetime,
  type,
  value,
  valueScan,
  fastInsulin,
  fastInsulinCount,
  food,
  foodGramm,
  foodPortions,
  depotInsulin,
  depotInsulinCount,
  notes,
  testSlip,
  keton,
  foodInsulin,
  correctionInsulin,
  changeInsulin,
}

/** Tolerant ISO parser */
export function parseFuckingFreestyleDate(s: string): number {
  const [dd, mm, yyyy, HH, MM] = s.split(/\D/).map(s => Number.parseInt(s))
  return new Date(yyyy, mm - 1, dd, HH, MM).getTime()
}

export function importData(rawData: string, personId: number): HealthUpdateData {
  const rows = csvParse(rawData, { separator: ',' })
  const points: HealthDataPoint[] = []
  const events: HealthEvent[] = []
  for (let index = 1; index < rows.length; index++) {
    const r = rows[index]
    const event = +r[FreestyleCsvColumns.type]
    const ts = parseFuckingFreestyleDate(r[FreestyleCsvColumns.datetime])
    log('row', event, ts, new Date(ts))
    if (event === 0) {
      points.push({
        personId,
        value: +r[FreestyleCsvColumns.value],
        ts,
        trend: 0,
      })
    }
    else if (event === 6) {
      const text = r[FreestyleCsvColumns.notes]
      if (text) {
        events.push({
          personId,
          text,
          ts,
          type: 'note',
        })
      }
    }
  }

  return { points, events }
}
