export const freestyleHosts: Record<string, string> = {
  ae: 'api-ae.libreview.io',
  ap: 'api-ap.libreview.io',
  au: 'api-au.libreview.io',
  ca: 'api-ca.libreview.io',
  de: 'api-de.libreview.io',
  eu: 'api-eu.libreview.io',
  eu2: 'api-eu2.libreview.io',
  fr: 'api-fr.libreview.io',
  jp: 'api-jp.libreview.io',
  us: 'api-us.libreview.io',
} as const

export const trendSymbolsFreestyle: Record<string, number> = {
  5: 2,
  4: 1,
  3: 0,
  2: -1,
  1: -2,
}

export interface Graph {
  status: number
  data: Data
  ticket: Ticket
}

export interface Data {
  connection: Connection
  activeSensors: ActiveSensor[]
  graphData: Glucose[]
}

export interface ActiveSensor {
  sensor: Sensor
  device: Device
}

export interface Device {
  did: string
  dtid: number
  v: string
  ll: number
  hl: number
  u: number
  fixedLowAlarmValues: FixedLowAlarmValues
  alarms: boolean
  fixedLowThreshold: number
}

export interface FixedLowAlarmValues {
  mgdl: number
  mmoll: number
}

export interface Sensor {
  deviceId: string
  sn: string
  a: number
  w: number
  pt: number
  s: boolean
  lj: boolean
}

export interface Connection {
  id: string
  patientId: string
  country: string
  status: number
  firstName: string
  lastName: string
  targetLow: number
  targetHigh: number
  uom: number
  sensor: Sensor
  alarmRules: any
  glucoseMeasurement: Glucose
  glucoseItem: Glucose
  glucoseAlarm: null
  patientDevice: Device
  created: number
}

export interface Glucose {
  FactoryTimestamp: string
  Timestamp: string
  type: number
  ValueInMgPerDl: number
  TrendArrow: number
  TrendMessage: null
  MeasurementColor: number
  GlucoseUnits: number
  Value: number
  isHigh: boolean
  isLow: boolean
}

export interface Ticket {
  token: string
  expires: number
  duration: number
}
