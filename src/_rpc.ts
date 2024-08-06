import type { HealtEventType, HealthEvent, HealthPerson, HealthUpdateData } from '@/services/_types'

export interface RpcServerFunctions {
  // Events
  getEventList: () => HealtEventType[]
  addEvent: (item: HealthEvent) => Promise<HealthEvent | undefined>
  updateEvent: (item: Partial<HealthEvent> & { id: number }) => void
  removeEvent: (id: number) => void

  // Persons
  getPerson: (id: number) => HealthPerson
  getPersonList: () => HealthPerson[]

  addPerson: (item: HealthPerson) => Promise<HealthPerson | undefined>
  updatePerson: (item: Partial<HealthPerson> & { id: number }) => void
  removePerson: (id: number) => void
  syncPersonOnce: (id: number) => void

  // Websocket
  subscribePerson: (personId: number) => void
  unsubscribePerson: () => void

  //
  getLastHours: (personId: number, hours: number) => HealthUpdateData
}

export interface RpcClientFunctions {
  updateData: (personId: number, data: HealthUpdateData) => void
  // updateEvents: (events: TableEvents[]) => void
}

// interface Tables {
//   event: HealtEventType
//   person: HealthPerson
// }

// type TableApi<Type> = {
//   [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
// } & {
//   [Property in keyof Type as `get${Capitalize<string & Property>}List`]: () => Type[Property][]
// } & {
//   [Property in keyof Type as `delete${Capitalize<string & Property>}`]: (id: number) => boolean
// }

// type Api = TableApi<Tables>

// interface TableFns<T> {
//   get: (id: number) => T
//   update: (id: number, item: Partial<T>) => boolean
//   remove: (id: number) => boolean
//   query: (opt: {
//     orderby?: string [] | string
//     limit?: number
//     offset?: number
//   }) => {
//     offset: number
//     total: number
//     rows: T[]
//   }
// }
