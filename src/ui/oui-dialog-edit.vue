<script lang="ts" setup>
import { OuiButton, OuiModal, OuiText, OuiWait } from 'oui-kit'
import { nextTick, ref } from 'vue'

defineProps<{
  title: string
  update?: boolean
  delete?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  save: []
  cancel: []
  delete: []
}>()

const wait = ref(false)

async function doSave() {
  wait.value = true
  await nextTick()
  emit('save')
}

async function doCancel() {
  emit('cancel')
}

async function doDelete() {
  // eslint-disable-next-line no-alert
  if (confirm('Are you shure?') === true)
    emit('delete')
}
</script>

<template>
  <OuiModal :title="title" @close="doCancel">
    <OuiText>
      <slot />
    </OuiText>
    <template #footer>
      <div class="ox ocenter">
        <div v-if="wait" class="ox wait">
          <OuiWait />
          <div>
            &nbsp;
            Please wait ...
          </div>
        </div>
        <template v-else>
          <slot name="left">
            <OuiButton v-if="update === true && $props.delete !== false" mode="danger" @click="doDelete">
              Löschen
            </OuiButton>
          </slot>
        </template>
        <div class="ospace" />
        <OuiButton :disabled="wait" mode="neutral" @click="doCancel">
          Abbrechen
        </OuiButton>
        <OuiButton :disabled="wait || disabled" @click="doSave">
          <template v-if="update">
            Speichern
          </template>
          <template v-else>
            Speichern
          </template>
        </OuiButton>
      </div>
    </template>
  </OuiModal>
</template>
