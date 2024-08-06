import type { LoggerInterface } from 'zeed'
import { Logger, getTimestamp, useDisposeWithUtils } from 'zeed'
import { on } from '@zerva/core'
import type { HealthPerson, ServiceConnection } from '@/services/_types'
import { emitter } from '@/services/_types'
import { useFreestyleClient } from '@/services/freestyle/client'
import { getLatestEntry, updatePoint } from '@/zerva/db'

const log: LoggerInterface = Logger('freestyle')

const minutes5 = 5 * 60 * 1000 // 300e3
// const safetySeconds = 20e3

export async function useFreestyle(service: HealthPerson): Promise<ServiceConnection | undefined> {
  const { username, password, id: personId } = service

  if (!(username && password)) {
    log.error('user name or password is missing. Please set env variables accordingly.')
    return
  }

  // Gracefully tear down everything
  const dispose = useDisposeWithUtils()
  on('serveStop', dispose)

  async function update() {
    try {
      const client = useFreestyleClient(service)

      const result = await client.graph()
      if (result) {
        result.graph.forEach(updatePoint)
        updatePoint(result.point)
        emitter.emit('didUpdate', personId)
      }
    }
    catch (err) {
      log.warn('update failed:', err)
    }
  }

  /** Update loop each 5 minutes. Optimized for better matching intervals and periods. */
  async function updateValues() {
    await update()

    let timeout = minutes5

    const last = getLatestEntry(personId)
    const now = getTimestamp()
    if (last) {
      const secondsSinceLast = now - last.ts
      timeout = Math.max(30e3, (minutes5 - secondsSinceLast))
    }

    // timeout += safetySeconds

    log.info(`Next refresh at ${new Date(now + timeout).toISOString()}`)

    dispose.timeout(updateValues, timeout)
  }

  if (service.monitor)
    updateValues()

  return {
    dispose,
    updateOnce: update,
  }
}
