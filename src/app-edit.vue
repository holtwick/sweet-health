<script lang="ts" setup>
import { OuiButton, OuiCheckbox, OuiInput, OuiPassword, OuiSelect } from 'oui-kit'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const person = ref()

const router = useRouter()
const route = useRoute()

watch(() => +(route.params.id ?? '0'), async (id) => {
  person.value = await rpc.getPerson(id)
}, { immediate: true })

const services = [
  ['dexcom', 'Dexcom G7'],
  ['freestyle', 'Abbott FreeStyle Libre'],
]

function doSave() {
  rpc.updatePerson(person.value)
  router.push('/')
}
</script>

<template>
  <div class="app-content">
    <template v-if="person">
      <OuiInput
        v-model="person.title"
        title="Title"
      />
      <OuiCheckbox v-model="person.monitor" switch title="Monitor" />
      <OuiSelect
        v-model="person.service"
        :options="services as any"
        title="Service"
      />
      <OuiInput
        v-model="person.username"
        title="Service User Name"
      />
      <OuiPassword
        v-model="person.password"
        title="Service Password"
        placeholder="Passwort nicht sichtbar"
      />
      <OuiButton @click="doSave">
        Save
      </OuiButton>
    </template>
  </div>
</template>
