import { csvParse } from 'zeed'
import type { HealthDataPoint, HealthEvent, HealthUpdateData } from '@/services/_types'
import { DexcomCol } from '@/services/dexcom/_types'
import { parseDateISOString } from '@/services/utilities'

export function importData(rawData: string, personId: number): HealthUpdateData {
  const rows = csvParse(rawData, { separator: ';' })
  const points: HealthDataPoint[] = []
  const events: HealthEvent[] = []
  for (let index = 1; index < rows.length; index++) {
    const r = rows[index]
    const event = r[DexcomCol.Event]
    if (event === 'EGV') {
      const date = parseDateISOString(r[DexcomCol.Date])
      points.push({
        personId,
        value: +r[DexcomCol.Glukosewert],
        ts: Math.round(date.getTime()),
        trend: 0,
      })
    }
  }

  return { points, events }
}
