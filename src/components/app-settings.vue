<script lang="ts" setup>
import type { OuiTableColumn } from 'oui-kit'
import { OuiButton, OuiTable, OuiText } from 'oui-kit'
import { CheckIcon, ChevronLeft, EditIcon, PlusSquare } from 'lucide-vue-next'
import { api } from '@/api'
import AppEditPerson from '@/ui/app-edit-person.vue'
import { openEditDialog } from '@/ui/use-edit'

import './app-settings.styl'

const data = api.data

const columns: OuiTableColumn[] = [
  { title: '#', name: 'id', sortable: false },
  { title: 'Name', name: 'title', sortable: true, width: 200 },
  { title: 'Service', name: 'service', sortable: true },
  { title: 'Monitor', name: 'monitor', align: 'center' },
  { title: '', name: 'action', align: 'right' },
]

async function doSync(id: number) {
  await api.rpc.syncPersonOnce(id)
}

function doEdit(id: number) {
  openEditDialog(AppEditPerson, id)
}

function doNew() {
  openEditDialog(AppEditPerson)
}
</script>

<template>
  <div class="app-settings">
    <OuiText>
      <h1>Admin</h1>

      <p>
        <router-link :to="{ name: 'home' }" class="oui-button">
          <ChevronLeft />
          Übersicht
        </router-link>
        <OuiButton @click="doNew">
          <PlusSquare /> Add new person
        </OuiButton>
      </p>
      <OuiTable :columns="columns" :data="api.data.persons as any">
        <template #col-monitor="{ value }">
          <template v-if="value">
            <CheckIcon />
          </template>
          <template v-else>
            -
          </template>
        </template>
        <template #col-action="{ item }">
          <OuiButton size="small" @click="doEdit(item.id)">
            <EditIcon /> Edit
          </OuiButton>
        </template>
      </OuiTable>
    </OuiText>
  </div>
</template>
