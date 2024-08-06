<script lang="ts" setup>
import { computed } from 'vue'
import { sortedOrderby } from 'zeed'
import type { HealthPoint } from '@/zerva/db/types'

const props = withDefaults(defineProps<{
  points: HealthPoint[]
  width?: number
  height?: number
  start?: number
  end?: number
}>(), {
  width: 260,
  height: 50,
})

function minMaxSum<T = Record<string, any>>(list: T[], propName: string) {
  let min: number | undefined
  let max: number | undefined
  let sum = 0
  let count = 0
  list.forEach((o: any) => {
    const v = o[propName]
    max = (max != null ? (v > max ? v : max) : v)
    min = (min != null ? (v < min ? v : min) : v)
    sum += v
    count += 1
  })
  return {
    min,
    max,
    sum,
    count,
    avg: sum / count,
  }
}

function paint() {
  // const values = api.data.points.map(p => p.value)
  // const twoHours = 1000 * 60 * 60 * 2
  const data: HealthPoint[] = sortedOrderby(props.points.filter((p) => {
    if (props.start && p.ts < props.start)
      return false
    if (props.end && p.ts > props.end)
      return false
    return true
  }) as any, 'ts asc')

  const ti = minMaxSum(data, 'ts')
  const vi = minMaxSum(data, 'value')

  if (props.end) {
    ti.max = Math.max(props.end, ti.max!)
  }

  const xf = props.width / (ti.max! - ti.min!)
  const yf = props.height / (vi.max! - vi.min!)

  let didM = false

  const vf = 1 / (vi.max! - vi.min!)

  const hours = []
  if (ti.min! < ti.max!) {
    let t = ti.min!
    while (t < ti.max!) {
      hours.push((t - ti.min!) * xf)
      t += 1000 * 60 * 60
    }
  }

  return {
    ti,
    vi,
    hours,
    high: Math.max(0, (180 - vi.min!) * vf),
    veryHigh: Math.max(0, (250 - vi.min!) * vf),
    middle: props.height - (100 - vi.min!) * yf,
    highY: props.height - (180 - vi.min!) * yf,
    veryHighY: props.height - (250 - vi.min!) * yf,
    data: data.map((p) => {
      const x = (p.ts - ti.min!) * xf
      const y = props.height - ((p.value - vi.min!) * yf)
      const d = didM ? 'L' : 'M'
      didM = true
      if (x >= 0 && y >= 0)
        return `${d}${x.toFixed(2)} ${y.toFixed(2)} `
      return ''
    }).join('\n'),
  }
}

const line = computed(() => paint())
const viewBox = computed(() => `0 0 ${props.width} ${props.height}`)
</script>

<template>
  <div class="app-events-graph _graph">
    <svg stroke-linecap="round" display="block" stroke-width="2" :viewBox="viewBox">
      <template v-for="x in line.hours" :key="x">
        <line :x1="x" :x2="x" y1="0" :y2="height" stroke="#ccc" stroke-width="1" />
      </template>

      <line :x1="0" :x2="width" :y1="line.middle" :y2="line.middle" stroke="lightgreen" stroke-width="1" />
      <line :x1="0" :x2="width" :y1="line.highY" :y2="line.highY" stroke="var(--state-warn)" stroke-width="1" />
      <line :x1="0" :x2="width" :y1="line.veryHighY" :y2="line.veryHighY" stroke="var(--state-critical)" stroke-width="1" />

      <path
        :d="line.data"
        fill="none"
        stroke="currentColor"
      />
    </svg>

    <div class="app-events-graph-details _details">
      <div>max: {{ Math.round(line.vi.max!) }}</div>
      <div>avg: {{ Math.round(line.vi.avg!) }}</div>
      <div>min: {{ Math.round(line.vi.min!) }}</div>
    </div>
  </div>
</template>
