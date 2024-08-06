import { useService } from '@/services'
import { tablePersons } from '@/zerva/db'
import { useRpcServerSide } from '@/zerva/rpc-server'
import { serve } from '@zerva/core'
import { useHttp } from '@zerva/http'
import { useWebsocketRpcHub } from '@zerva/rpc'
import { useVite } from '@zerva/vite'
import process from 'node:process'
import type { LoggerInterface } from 'zeed'
import { Logger, setupEnv, sleep, toPath } from 'zeed'

const log: LoggerInterface = Logger('setup')

process.on('uncaughtException', err => log.error('uncaughtException', err))

// Reads .env and .env.local files
// if (process.env.ZERVA_MODE === 'development')
setupEnv()

// Web server
useHttp({
  // host: '0.0.0.0',
  port: +(process.env.PORT || 8080),
  helmet: false,
})

useVite({
  root: toPath('.'),
  www: toPath('www'),
})

useWebsocketRpcHub({
  log: 0,
})

useRpcServerSide()

// useDatabaseApi()

log('start service sync')
sleep(1000).then(() => {
  // useMigration()
  tablePersons.all().forEach(useService)
})

void serve()
