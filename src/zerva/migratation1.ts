import { on } from '@zerva/core'
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import { useSqliteDatabase } from './db/sqlite'
import { updatePoint } from '@/zerva/db'

const log: LoggerInterface = Logger('migration')

export function useMigration() {
  const db = useSqliteDatabase('./data/dexcom.sqlite', {
    verbose: log,
    // log: 0,
  })

  on('serveStop', db.dispose)

  const table = db.table<any>('dexcom', {
    ts: 'number',
    value: 'number',
    trend: 'string',
  })

  table.index('ts')

  table.all().forEach((p) => {
    updatePoint({
      ts: p.ts,
      value: p.value,
      trend: 0,
      personId: 1,
    })
  })
}
