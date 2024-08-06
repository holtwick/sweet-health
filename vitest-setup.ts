import { getGlobalLogger, setUuidDefaultEncoding, setupEnv } from 'zeed'

// Someone else also sets the logger?!
getGlobalLogger().setLock(true)

setUuidDefaultEncoding('base32')

setupEnv()

// eslint-disable-next-line no-console
console.info('vitest setup performed!')
