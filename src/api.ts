import { useWebsocketRpcHubClient } from '@zerva/rpc'
import { reactive, readonly } from 'vue'
import type { LoggerInterface } from 'zeed'
import { Logger, cloneObject, isEmpty } from 'zeed'
import type { HealthDataPoint, HealthEvent, HealthPerson, HealthUpdateData } from './services/_types'
import type { RpcClientFunctions, RpcServerFunctions } from '@/_rpc'

const log: LoggerInterface = Logger('api')

interface HealthApi {
  isOnline: boolean
  persons: Record<number, HealthPerson>
  events: Record<number, HealthEvent>
  points: HealthDataPoint[]
  activePerson?: number
  person?: HealthPerson
}

function useHealthApi() {
  const data = reactive<HealthApi>({
    isOnline: false,
    persons: [],
    events: [],
    points: [],
  })

  const { rpcHub, channel } = useWebsocketRpcHubClient(undefined, { log: 0 })

  const rpc = rpcHub<RpcClientFunctions, RpcServerFunctions>({
    updateData(id: number, _data: HealthUpdateData) {
      if (data.activePerson !== id)
        return
      log('received data', _data)
      data.events = Object.fromEntries((_data.events ?? []).map(p => [p.id, p]))
      data.points = _data.points
    },
  })

  channel.on('connect', async () => {
    data.isOnline = true

    const persons = await rpc.getPersonList()
    data.persons = Object.fromEntries((persons ?? []).map(p => [p.id, p]))

    if (data.activePerson) {
      await rpc.subscribePerson(data.activePerson)
      data.person = data.persons[data.activePerson]
    }
  })

  channel.on('disconnect', () => data.isOnline = false)
  channel.on('close', () => data.isOnline = false)

  async function updatePerson(person: HealthPerson) {
    log('updatePerson', person)

    const item = cloneObject(person)
    log.assert(item.id && data.persons[item.id], 'expected item.id')
    if (isEmpty(item.password))
      delete item.password
    await rpc.updatePerson(item)
    log('item', item)
    Object.assign(data.persons[item.id], item)
  }

  async function addPerson(person: HealthPerson) {
    log('addPerson', person)

    const item = cloneObject(person)
    const newItem = await rpc.addPerson(item)
    log('item', newItem, item)
    if (newItem)
      data.persons[newItem.id] = newItem
  }

  async function updateEvent(event: HealthEvent) {
    log('updateEvent', event)
    const item = cloneObject(event)
    log.assert(item.id && data.events[item.id], 'expected item.id')
    await rpc.updateEvent(item)
    log('item', item)
    Object.assign(data.events[item.id], item)
  }

  async function addEvent(event: HealthEvent) {
    log('addEvent', event)

    const item = cloneObject(event)
    // log.assert(item.id && data.events[item.id], 'expected item.id')
    const newItem = await rpc.addEvent(item)
    log('item', newItem, item)
    if (newItem)
      data.events[newItem.id] = newItem
  }

  /** Receive data from this person only. `0` to set to no person. */
  async function subscribePerson(id: number) {
    log('subscribePerson', id)

    const newPersonId = id ?? 0
    if (data.activePerson === newPersonId)
      return

    data.events = {}
    data.points = []
    data.activePerson = newPersonId

    // personData.value = await rpc.getPerson(newPersonId)

    await rpc.unsubscribePerson()

    if (id)
      await rpc.subscribePerson(id)

    data.person = data.persons[data.activePerson]
  }

  return {
    rpc,
    data: readonly(data),
    updatePerson,
    addPerson,
    updateEvent,
    addEvent,
    subscribePerson,
  }
}

export const api = useHealthApi()
