<script lang="ts" setup>
import { api } from '@/api'
import AppEditPerson from '@/ui/app-edit-person.vue'
import { openEditDialog } from '@/ui/use-edit'

import './app-index.styl'

const version = import.meta.env.APP_RELEASE
const date = new Date(+import.meta.env.APP_TIMESTAMP).toISOString()

function doNew() {
  openEditDialog(AppEditPerson)
}
</script>

<template>
  <div class="app-index">
    <div class="menu">
      <template v-for="item in api.data.persons" :key="item.id">
        <router-link :to="`/view/${item.id}`">
          {{ item.title }}
        </router-link>
      </template>
    </div>
    <footer>
      <div>
        {{ version }} ({{ date }})
      </div>
      <router-link :to="{ name: 'admin' }">
        Admin
      </router-link>
      <!-- <button @click="doNew">
        Add new person
      </button> -->
    </footer>
  </div>
</template>
