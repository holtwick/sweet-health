// Sources:
// https://github.com/FokkeZB/libreview-unofficial
//  https://libreview-unofficial.stoplight.io/docs/libreview-unofficial/8i2x0tc4qumh2-authentication
// https://github.com/timoschlueter/nightscout-librelink-up

import type { LoggerInterface } from 'zeed'
import { Logger, datetimeToUTC } from 'zeed'
import type { HealthDataPoint, HealthPerson } from '../_types'
import { type Glucose, freestyleHosts, trendSymbolsFreestyle } from './_types'

const log: LoggerInterface = Logger('freestyle-client')

const defaultHeaders = {
  version: '4.7',
  product: 'llu.android',
  Accept: 'application/json',
}

async function fetchJson(
  input: URL | string,
  init?: any,
): Promise<any> {
  try {
    const response = await fetch(input, init)
    log.info(`fetch status=${response.status}:`, input)
    const text = await response.text()
    log.info('fetch result', text)
    return JSON.parse(text)
  }
  catch (e) {
    log.error('fetchJson error:', e)
    throw e
  }
}

export function useFreestyleClient(opt: HealthPerson) {
  const {
    username: email,
    password,
    location,
    id: personId,
  } = opt

  let host = freestyleHosts.us

  function updateLocation(location?: string) {
    host = freestyleHosts[location ?? 'us'] ?? freestyleHosts.us
  }

  updateLocation(location)

  let loginResult: any | undefined
  let patientId: string | undefined

  function getToken() {
    return `Bearer ${loginResult.authTicket.token}`
  }

  async function login() {
    // log.info('login', email)
    const url = `https://${host}/llu/auth/login`
    const options = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }

    const json = await fetchJson(url, options)
    if (json && json.status === 0) {
      if (json.data?.redirect === true) {
        updateLocation(json.data.region)
        await login()
      }
      else {
        loginResult = json.data
      }
    }
  }

  async function connections() {
    // log.info('connections', loginResult)
    if (!loginResult)
      await login()

    const url = `https://${host}/llu/connections`
    const options = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: getToken(),
      },
    }

    const json = await fetchJson(url, options)
    if (json && json.status === 0) {
      const data = json.data
      if (data.length > 0)
        patientId = data[0].patientId
    }
  }

  async function logbook(full = false) {
    // log.info('logbook', patientId)

    if (!patientId)
      await connections()

    const url = `https://${host}/llu/connections/${patientId}/logbook`
    const options = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: getToken(),
      },
    }

    return await fetchJson(url, options)
  }

  async function graph(full = false) {
    // log.info('graph', patientId)

    if (!patientId)
      await connections()

    const url = `https://${host}/llu/connections/${patientId}/graph`
    const options = {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: getToken(),
      },
    }

    function parseItem(item: Glucose): HealthDataPoint {
      const date = new Date(item.FactoryTimestamp)
      const trend = trendSymbolsFreestyle[item.TrendArrow ?? 0] ?? 0
      return {
        personId,
        ts: datetimeToUTC(date).getTime(),
        value: item.ValueInMgPerDl,
        trend,
      }
    }

    const json = await fetchJson(url, options)

    if (json && json.status === 0) {
      const point = parseItem(json.data.connection.glucoseMeasurement)
      const graph: HealthDataPoint[] = json.data.graphData?.map(parseItem)
      return { point, graph }
    }
  }

  return { logbook, graph }
}
