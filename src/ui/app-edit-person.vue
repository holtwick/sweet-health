<script lang="ts" setup>
import { OuiCheckbox, OuiInput, OuiPassword, OuiSelect } from 'oui-kit'
import { computed, reactive } from 'vue'
import { cloneObject, isBoolean, isEmpty, jsonStringifySorted, objectPlain } from 'zeed'
import { api } from '@/api'
import type { HealthPerson } from '@/services/_types'
import { freestyleHosts } from '@/services/freestyle/_types'
import OuiDialogEdit from '@/ui/oui-dialog-edit.vue'

const props = defineProps<{
  id?: number
  done?: any
}>()

const update = !!props.id

const item = reactive<HealthPerson>(props.id
  ? cloneObject(api.data.persons[props.id]) as any
  : {
      monitor: false,
      location: 'us',
    })

function snapshot() {
  return jsonStringifySorted(objectPlain(item, {
    transformer: v => isBoolean(v) ? +v : undefined,
  }))
}

const reference = snapshot()

// if (!item)
//   // eslint-disable-next-line no-alert
//   alert('Item not available')

const services = [
  ['dexcom', 'Dexcom G7'],
  ['freestyle', 'Abbott FreeStyle Libre'],
]

const locations = Object.keys(freestyleHosts)

async function doSave() {
  if (update)
    await api.updatePerson(item)
  else
    await api.addPerson(item)
  props.done()
}

const disabled = computed(() => isEmpty(item.title) || isEmpty(item.service) || snapshot() === reference)
</script>

<template>
  <template v-if="item">
    <OuiDialogEdit
      title="Person"
      :update="update"
      :disabled="disabled"
      @save="doSave"
      @cancel="done"
      @delete="done"
    >
      <OuiInput
        v-model="item.title"
        class="_focus"
        title="Title"
        required
      />

      <OuiSelect
        v-model="item.service"
        :options="services as any"
        title="Service"
        required
      />

      <OuiSelect
        v-model="item.location"
        :disabled="item.service !== 'freestyle'"
        :options="locations"
        title="Location"
      />

      <OuiInput
        v-model="item.username"
        title="Service User Name"
      />

      <OuiPassword
        v-model="item.password"
        title="Service Password"
        placeholder="Bestehendes Passwort wird nicht angezeigt"
      />

      <OuiCheckbox v-model="item.monitor" switch title="Monitor" />
    </OuiDialogEdit>
  </template>
</template>
