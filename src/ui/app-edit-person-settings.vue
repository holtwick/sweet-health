<script lang="ts" setup>
import { RefreshCw } from 'lucide-vue-next'
import { OuiButton, OuiInput } from 'oui-kit'
import { computed, reactive } from 'vue'
import { cloneObject, isBoolean, isEmpty, jsonStringifySorted, objectPlain } from 'zeed'
import OuiDialogEdit from '@/ui/oui-dialog-edit.vue'
import type { HealthPerson } from '@/services/_types'
import { api } from '@/api'

const props = defineProps<{
  id?: number
  done?: any
}>()

const item = reactive<HealthPerson>(props.id
  ? cloneObject(api.data.persons[props.id]) as any
  : {
      monitor: false,
    })

function snapshot() {
  return jsonStringifySorted(objectPlain(item, {
    transformer: v => isBoolean(v) ? +v : undefined,
  }))
}

const reference = snapshot()

async function doSave() {
  await api.updatePerson(item)
  props.done()
}

function doSync() {
  api.rpc.syncPersonOnce(item.id)
}

const disabled = computed(() => isEmpty(item.title) || isEmpty(item.service) || snapshot() === reference)
</script>

<template>
  <template v-if="item">
    <OuiDialogEdit
      title="Person"
      update
      :disabled="disabled"
      @save="doSave"
      @cancel="done"
    >
      <OuiInput
        v-model="item.title"
        class="_focus"
        title="Title"
        required
      />

      <OuiInput
        v-model="item.limitVeryHigh"
        title="Oberstes Limit (250)"
      />

      <OuiInput
        v-model="item.limitHigh"
        title="Oberes Limit (170)"
      />

      <OuiInput
        v-model="item.limitLow"
        title="Unteres Limit (70)"
      />

      <OuiInput
        v-model="item.limitVeryLow"
        title="Unterstes Limit (55)"
      />

      <template #left>
        <OuiButton @click="doSync">
          <RefreshCw /> Sync
        </OuiButton>
      </template>
    </OuiDialogEdit>
  </template>
</template>
