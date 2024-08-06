declare global {
  interface Window {
    isNodeTestEnv?: boolean
  }

  namespace globalThis {
    let isNodeTestEnv: boolean

    const DEBUG: boolean

    const ZERVA_DEVELOPMENT: boolean
    const ZERVA_PRODUCTION: boolean
  }
}
