import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'
import { api } from '@/api'

const log: LoggerInterface = Logger('router')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./app-index.vue'),
  },

  {
    path: '/view/:person',
    component: () => import('./app-view.vue'),

    children: [
      {
        path: '',
        name: 'charts',
        component: () => import('./components/app-chart.vue'),
      },

      {
        path: 'events',
        name: 'events',
        component: () => import('./components/app-events.vue'),
      },

      {
        path: 'stats',
        name: 'stats',
        component: () => import('./components/app-stats.vue'),
      },

    ],
  },

  {
    path: '/print/:person',
    name: 'print',
    component: () => import('./components/app-events-print.vue'),
  },
  // {
  //   path: '/edit/:id',
  //   component: () => import('./app-edit.vue'),
  // },

  {
    path: '/admin',
    name: 'admin',
    component: () => import('./components/app-settings.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('./app-index.vue'),
  },
]

export const router = createRouter({
  routes,
  history: createWebHistory(),
})

router.beforeEach(async (to, from, next) => {
  log.info(`before route to=${to?.fullPath} from=${from?.fullPath}`)

  api.subscribePerson(+to.params.person)
  next()
})
