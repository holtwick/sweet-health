import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import type { HealthPerson, ServiceConnection } from '@/services/_types'
import { useDexcom } from '@/services/dexcom'
import { useFreestyle } from '@/services/freestyle'

const log: LoggerInterface = Logger('service')

const services: Record<number, ServiceConnection> = {}

export async function useService(person: HealthPerson): Promise<ServiceConnection | undefined> {
  if (services[person.id]) {
    await services[person.id].dispose()
    delete services[person.id]
  }

  let serviceConnection
  if (person.service === 'dexcom')
    serviceConnection = await useDexcom(person)
  else if (person.service === 'freestyle')
    serviceConnection = await useFreestyle(person)
  else
    log.warn('unknown service for person', person)

  if (serviceConnection)
    services[person.id] = serviceConnection

  return serviceConnection
}

export function getService(id: number) {
  return services[id]
}
