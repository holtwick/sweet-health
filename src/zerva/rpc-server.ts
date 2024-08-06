import { on } from '@zerva/core'
import type { LoggerInterface } from 'zeed'
import { Logger, debounce, objectOmit } from 'zeed'
import { tableEvents, tablePersons, tablePoints } from './db'
import type { RpcClientFunctions, RpcServerFunctions } from '@/_rpc'
import { getService, useService } from '@/services'
import type { HealthEvent, HealthPerson, HealthUpdateData } from '@/services/_types'
import { emitter } from '@/services/_types'

const log: LoggerInterface = Logger('rpc-server')

export function getLastHours(personId: number, hours = 24): HealthUpdateData {
  const ts = new Date().getTime() - hours * 60 * 60 * 1000

  const points = tablePoints.query(
    `SELECT * FROM ${tablePoints.name} WHERE personId=? AND ts>?`,
    personId,
    ts,
  )

  const events = tableEvents.query(
    `SELECT * FROM ${tableEvents.name}  WHERE personId=? AND ts>?`,
    personId,
    ts,
  )

  return { points, events }
}

export function useRpcServerSide() {
  // const pool: RPCReturn<RpcClientFunctions>[] = []

  log.info('useRpcServerSide')

  on('rpcConnect', async ({ rpcHub, dispose }) => {
    let personId = 0

    const rpc = rpcHub<RpcServerFunctions, RpcClientFunctions>({

      // Event

      async addEvent(item) {
        const id = tableEvents.insert(item)
        return await handleEvent(id)
      },
      async updateEvent(item) {
        log('updateevent', item)
        tableEvents.update(item.id, item)
        return await handleEvent(item.id)
      },
      async removeEvent(id) {
        tableEvents.delete(id)
        return await handleEvent(id)
      },
      getEventList() {
        return tableEvents.all() as any
      },

      // Person

      getPerson(id) {
        return tablePersons.get(id) as any
      },
      getPersonList() {
        log('getPersonList')
        return tablePersons.all().map(p => objectOmit(p, 'password'))
        // const persons = tablePersons.all().map(r => ({
        //   id: r.id,
        //   title: r.title,
        //   uid: r.uid,
        //   service: r.service,
        // } as any))
        // log('persons', persons)
        // return persons
      },
      async addPerson(item) {
        const id = tablePersons.insert(item)
        return await handlePerson(id)
      },
      async updatePerson(item) {
        tablePersons.upsert('id', item)
        return await handlePerson(item.id)
      },
      async removePerson(id) {
        tablePersons.delete(id)
        return await handlePerson(id)
      },
      async syncPersonOnce(id) {
        log('syncPersonOnce')
        const service = getService(id)
        if (service)
          await service.updateOnce()
      },

      // Subscribe

      subscribePerson(id) {
        log.info('subscribePerson', id)
        personId = id
        update()
      },
      unsubscribePerson() {
        log.info('unsubscribePerson')
        personId = 0
      },

      // Functions
      getLastHours,
    })

    async function update() {
      log.info('update', personId)
      if (!personId)
        return
      const data = getLastHours(personId, 24)
      await rpc.updateData(personId, data)
    }

    const lazyUpdate = debounce(update, { delay: 1000 })

    dispose.on(emitter, 'didUpdate', lazyUpdate)
    update()

    async function handlePerson(id?: number) {
      const person = id ? tablePersons.get(id) : undefined
      if (person)
        await useService(person)
      lazyUpdate()
      return person as HealthPerson
    }

    async function handleEvent(id?: number) {
      const event = id ? tableEvents.get(id) : undefined
      lazyUpdate()
      return event as HealthEvent
    }

    // pool.push(rpc)
    // dispose.add(() => arrayRemoveElement(pool, rpc))
  })

  return { }
}
