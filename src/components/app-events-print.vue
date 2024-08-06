<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { sortedOrderby } from 'zeed'
import OuiGraph from '@/components/oui-graph.vue'
import { api } from '@/api'

import './app-events-print.styl'

const h = 6
const timeWindow = 1000 * 60 * 60 * h

const route = useRoute()
const data = computedAsync(async () => {
  const data = await api.rpc.getLastHours(+route.params.person, 14 * 24)

  const events = sortedOrderby(
    Object.values(data.events).map((e) => {
      const date = new Date(e.ts)
      return {
        day: date.toLocaleString('de', { weekday: 'short' }),
        time: date.toLocaleString('de', { timeStyle: 'short' }),
        date: date.toLocaleString('de', { dateStyle: 'short' }),
        isoDate: date.toISOString().slice(0, 10),
        ...e,
      }
    }),
    'isoDate desc',
    'time asc',
  ) as any

  let prevDate = ''
  for (const e of events) {
    e.header = e.isoDate !== prevDate
    prevDate = e.isoDate
  }

  return {
    events,
    points: sortedOrderby(data.points, 'ts asc'),
  }
})
</script>

<template>
  <template v-if="data">
    <div class="app-print">
      <h1>Protocol</h1>
      <p>
        The diagrams show the following 6 hours. Vertical lines mark the 60-minute intervals. Horizontal lines mark limit values:
        <br> green = 180 mg/dl, red = 250 mg/dl.
      </p>
      <template v-for="item in data.events" :key="item.id">
        <template v-if="item.header">
          <div class="_header">
            <div class="_weekday">
              {{ item.day }}
            </div>
            <div class="date">
              {{ item.date }}
            </div>
          </div>
        </template>
        <div class="_item">
          <div class="_time">
            {{ item.time }}
          </div>
          <OuiGraph
            :points="data.points as any"
            :height="48"
            :start="item.ts"
            :end="item.ts + timeWindow"
          />
          <div class="_text">
            {{ item.text }}
          </div>
        </div>
      </template>
    </div>
  </template>
</template>
