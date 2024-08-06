import { createApp } from 'vue'
import { Logger } from 'zeed'
import appComponent from './app.vue'
import { i18n } from './i18n'
import { router } from './router'

const log = Logger('main')

log(`env = ${JSON.stringify(import.meta.env, null, 2)}`)

const app = createApp(appComponent)
app.use(router)
app.use(i18n)
app.mount('#app')
