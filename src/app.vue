<script lang="ts" setup>
import { OuiMobileActivator } from 'oui-kit'
import { api } from '@/api'

import './app.styl'

// const info = import.meta.env
</script>

<template>
  <div v-if="!api.data.isOnline" class="app-offline">
    <div>Currently offline. Check internet connection.</div>
  </div>
  <router-view />
  <!-- <div class="debug">
    {{ info }}
  </div> -->
  <OuiMobileActivator />
</template>
