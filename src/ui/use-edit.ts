import { useDialog } from 'oui-kit'
import type { Component } from 'vue'

export function openEditDialog(component: Component, id?: number) {
  const { open } = useDialog(component)
  open({ id })
}
