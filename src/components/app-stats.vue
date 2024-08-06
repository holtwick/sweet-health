<script lang="ts" setup>
import { useIntervalFn, useWindowSize } from '@vueuse/core'
import { OuiCard } from 'oui-kit'
import { computed, ref } from 'vue'
import { arrayAvg, arraySum, first, getTimestamp, roundArrayOfNumbersToMatchSum, sortedOrderby } from 'zeed'
import type { HealthDataPoint } from '@/services/_types'
import { api } from '@/api'

import './app-chart.styl'

const hours = { value: 24 }

const currentPoints = computed(() => sortedOrderby(api.data.points.filter(item => item.ts >= getTimestamp() - hours.value * 60 * 60 * 1000), 'ts desc'))
const currentEntry = computed<HealthDataPoint | undefined>(() => first(currentPoints.value))
const currentAvg = computed(() => arrayAvg(currentPoints.value.map(p => p.value)))

const header = ref()

const { height: windowHeight } = useWindowSize()

const currentExceed = computed(() => {
  // Sehr niedrig <54
  // Niedrig 54 - 70
  // Im Zielbereich 70–180
  // Hoch 180 - 250
  // Sehr hoch > 250

  const target = {
    veryhigh: 0,
    high: 0,
    normal: 0,
    low: 0,
    verylow: 0,
    total: 0,
  }

  currentPoints.value.forEach((e) => {
    ++target.total
    if (e.value < 54)
      ++target.verylow
    else if (e.value < 70)
      ++target.low
    else if (e.value <= 180)
      ++target.normal
    else if (e.value <= 250)
      ++target.high
    else ++target.veryhigh
  })

  return target
})

const currentPercentages = computed(() => {
  const target = [
    currentExceed.value.veryhigh,
    currentExceed.value.high,
    currentExceed.value.normal,
    currentExceed.value.low,
    currentExceed.value.verylow,
  ]

  const total = arraySum(target)

  return roundArrayOfNumbersToMatchSum(target.map(n => 100 * n / total))
})

const now = ref(getTimestamp())
useIntervalFn(() => now.value = getTimestamp(), 1e3)
const currentTimeAgo = computed(() => Math.round((now.value - (currentEntry.value?.ts ?? 0)) / 60e3))
</script>

<template>
  <div class="table">
    <OuiCard title="Auswertung">
      <table>
        <tr>
          <td>Durchschnitt</td>
          <td>{{ Math.round(currentAvg) }} mg/dl</td>
        </tr>
        <tr>
          <td>
            Sehr hoch &gt; 250
          </td>
          <td>
            {{ currentPercentages[0] }} %
          </td>
        </tr>
        <tr>
          <td>
            Hoch 180 - 250
          </td>
          <td>
            {{ currentPercentages[1] }} %
          </td>
        </tr>
        <tr>
          <td>
            Im Zielbereich 70 - 180
          </td><td>
            {{ currentPercentages[2] }} %
          </td>
        </tr>
        <tr>
          <td>
            Niedrig 54 - 70
          </td><td>
            {{ currentPercentages[3] }} %
          </td>
        </tr>
        <tr>
          <td>
            Sehr niedrig &lt;54
          </td><td>
            {{ currentPercentages[4] }} %
          </td>
        </tr>
      </table>
    </OuiCard>
  </div>
</template>
