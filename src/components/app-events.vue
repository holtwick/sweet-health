<script lang="ts" setup>
import { OuiButton } from 'oui-kit'
import type { LoggerInterface } from 'zeed'
import { PlusCircle, PrinterIcon } from 'lucide-vue-next'
import { Logger, sortedOrderby } from 'zeed'
import { api } from '@/api'
import type { HealthEvent } from '@/services/_types'
import AppEditEvent from '@/ui/app-edit-event.vue'
import { openEditDialog } from '@/ui/use-edit'
import OuiGraph from '@/components/oui-graph.vue'

import './app-events.styl'

const log: LoggerInterface = Logger('app-events')

const data = sortedOrderby(Object.values(api.data.events) as any, 'ts desc') as HealthEvent[]

function doEditEvent(id?: number) {
  log('doEditEvent', id)
  openEditDialog(AppEditEvent, id)
}

const h = 8
const timeWindow = 1000 * 60 * 60 * h
</script>

<template>
  <template v-if="data">
    <div class="app-events">
      <header>
        <OuiButton @click="doEditEvent(undefined)">
          <PlusCircle /> Ereignis hinzufügen
        </OuiButton>
        <router-link
          class="oui-button"
          target="_blank"
          :to="{
            name: 'print',
            params: {
              person: api.data.activePerson,
            },
          }"
        >
          <PrinterIcon />
          Print View
        </router-link>
      </header>
      <template v-for="item in data" :key="item.id">
        <div class="app-events-item" @click="doEditEvent(item.id)">
          <div class="app-events-left">
            <div class="app-events-ts">
              {{
                new Date(item.ts).toLocaleString('de', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              }}
            </div>
            <div class="app-events-title">
              {{ item.text }}
            </div>
          </div>
          <div>
            <OuiGraph
              :points="api.data.points as any"
              :height="48"
              :start="item.ts"
              :end="item.ts + timeWindow"
            />
          </div>
        </div>
      </template>
      <p>Die Linien zeigen ein {{ h }}h Zeitfenster der anschließenden Werte.</p>
    </div>
  </template>
</template>
