<script lang="ts" setup>
import { OuiDatetime, OuiInput } from 'oui-kit'
import { computed, reactive } from 'vue'
import { cloneObject, getTimestamp, isBoolean, isEmpty, jsonStringifySorted, objectPlain } from 'zeed'
import { api } from '@/api'
import type { HealthEvent } from '@/services/_types'
import OuiDialogEdit from '@/ui/oui-dialog-edit.vue'

const props = defineProps<{
  id?: number
  done?: any
}>()

const update = !!props.id

const item = reactive<HealthEvent>(props.id
  ? cloneObject(api.data.events[props.id]) as any
  : {
      personId: api.data.activePerson,
      ts: getTimestamp(),
    })

function snapshot() {
  return jsonStringifySorted(objectPlain(item, {
    transformer: v => isBoolean(v) ? +v : undefined,
  }))
}

const reference = snapshot()

async function doSave() {
  if (update)
    await api.updateEvent(item)
  else
    await api.addEvent(item)
  props.done()
}
async function doDelete() {
  if (update)
    await api.rpc.removeEvent(item.id)
  props.done()
}

const disabled = computed(() => isEmpty(item.text) || snapshot() === reference)
</script>

<template>
  <template v-if="item">
    <OuiDialogEdit
      title="Person"
      :update="update"
      :disabled="disabled"
      delete
      @save="doSave"
      @cancel="done"
      @delete="doDelete"
    >
      <OuiInput
        v-model="item.text"
        class="_focus"
        title="Beschreibung"
        required
      />

      <OuiDatetime v-model="item.ts" title="Zeitpunkt" />
      <!-- <OuiFile v-model="item." title="Datei" /> -->

      <!-- <pre>{{ item }}</pre> -->
    </OuiDialogEdit>
  </template>
</template>
