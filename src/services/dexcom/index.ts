import process from 'node:process'
import { on } from '@zerva/core'
import type { LoggerInterface } from 'zeed'
import { Logger, getTimestamp, useDisposeWithUtils, valueToBoolean } from 'zeed'
import { DexcomClient } from './client'
import { getLatestEntry, updatePoint } from '@/zerva/db'
import { type GlucoseEntry, trendNumbers } from '@/services/dexcom/_types'
import type { HealthPerson, ServiceConnection } from '@/services/_types'
import { emitter } from '@/services/_types'

const log: LoggerInterface = Logger('dexcom')

const minutes5 = 5 * 60 * 1000 // 300e3
const minutesOneDays = 25 * 60 // 25h max available

const safetySeconds = 20e3
const safetyMaxCount = 2
const safetyMinutes = 10

export async function useDexcom(person: HealthPerson): Promise<ServiceConnection | undefined> {
  const { username, password, id: personId } = person

  if (!(username && password)) {
    log.error('DEXCOM_USERNAME or DEXCOM_PASSWORD is missing. Please set env variables accordingly.')
    return
  }

  log.info(`setup dexcom for ${person.title} with user name ${person.username}. monitor=${person.monitor}`)

  const client = new DexcomClient({
    username,
    password,
    server: 'eu',
  })

  function updateDexcom(item: GlucoseEntry) {
    const trend = trendNumbers[(item.trend ?? 'flat').toLowerCase()] ?? 0
    updatePoint({
      personId,
      ts: item.timestamp,
      value: item.mgdl,
      trend,
    })
  }

  /** Fetches entries of last `minutes` and writes them to database */
  async function update(minutes = 10) {
    try {
      log.info('get dexcom')
      minutes = Math.ceil(minutes / 5) * 5
      const maxCount = (minutes / 5) + safetyMaxCount
      const data = await client.getEstimatedGlucoseValues({ maxCount, minutes })
      log.info(`Received ${data.length} entries for the last ${minutes} minutes`)
      if (data?.length)
        data.forEach(updateDexcom)
      emitter.emit('didUpdate', personId)
    }
    catch (err) {
      log.warn('update failed:', err)
    }
  }

  // Gracefully tear down everything
  const dispose = useDisposeWithUtils()
  on('serveStop', dispose)

  /** Update loop each 5 minutes. Optimized for better matching intervals and periods. */
  async function updateValues(minutes = minutesOneDays) {
    if (minutes > 0)
      await update(minutes)

    let timeout = minutes5
    minutes = minutesOneDays

    const last = getLatestEntry(personId)
    const now = getTimestamp()
    if (last) {
      const secondsSinceLast = now - last.ts
      timeout = Math.max(30e3, (minutes5 - secondsSinceLast))
      // minutes = Math.ceil(secondsSinceLast / minutes5) // todo or skip every x times?
    }

    minutes += safetyMinutes
    timeout += safetySeconds

    log.info(`Next refresh at ${new Date(now + timeout).toISOString()} covering ${minutes} minutes`)

    dispose.timeout(() => updateValues(minutes), timeout)
  }

  // First time get as much as possible
  if (valueToBoolean(process.env.HEALTH_SERVICE_MONITOR, true)) {
    if (person.monitor)
      updateValues()
  }

  return {
    dispose,
    updateOnce: () => update(minutesOneDays),
  }
}
