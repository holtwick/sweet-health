<script lang="ts" setup>
import { Calendar, ChevronLeft, LineChart, Percent, UserCog } from 'lucide-vue-next'
import { api } from '@/api'
import AppEditPersonSettings from '@/ui/app-edit-person-settings.vue'
import { openEditDialog } from '@/ui/use-edit'

import './app-view.styl'

function doSettings() {
  openEditDialog(AppEditPersonSettings, api.data.activePerson)
}
</script>

<template>
  <template v-if="api.data.activePerson">
    <header class="app-view-header">
      <router-link :to="{ name: 'home' }">
        <ChevronLeft />
        <em>Übersicht</em>
      </router-link>
      <router-link :to="{ name: 'charts' }">
        <LineChart />
        <em>Aktuell</em>
      </router-link>
      <router-link :to="{ name: 'events' }">
        <Calendar />
        <em>Essen</em>
      </router-link>
      <router-link :to="{ name: 'stats' }">
        <Percent />
        <em>Analyse</em>
      </router-link>
      <div class="ospace" />
      <button @click="doSettings">
        <UserCog />
        <em>{{ api.data.person?.title }}</em>
      </button>
    </header>
    <main class="app-view-body">
      <template v-if="api.data">
        <router-view />
      </template>
    </main>
  </template>
</template>
