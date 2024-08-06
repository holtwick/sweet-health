<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'
import type { OuiTableColumn } from 'oui-kit'
import { OuiTableview } from 'oui-kit'
import { sortedOrderby } from 'zeed'
import { openEditDialog } from '@/ui/use-edit'
import AppEditEvent from '@/ui/app-edit-event.vue'
import { api } from '@/api'

import './app-events.styl'

const modelSort = defineModel<string>('ts desc')
const modelSelected = defineModel<number | undefined>()

const data = computedAsync(() => sortedOrderby(Object.values(api.data.events) as any, 'ts desc'))

const columns: OuiTableColumn[] = [
  // { title: '#', name: 'id', sortable: false },
  { title: 'Datum', name: 'ts', sortable: true, width: 320 },
  { title: 'Beschreibung', name: 'text', sortable: true },
]

function doEditEvent(row: any) {
  openEditDialog(AppEditEvent, row.id)
}
</script>

<template>
  <template v-if="data">
    <div class="app-events">
      <OuiTableview
        v-model="modelSelected"
        v-model:sort="modelSort"
        :columns="columns"
        :data="data as any"
        :row-height="28"
        @select="doEditEvent"
      >
        <template #col-ts="{ item }">
          {{ new Date(item.ts).toLocaleString('de', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }) }}
        </template>
      </OuiTableview>
    </div>
  </template>
</template>
