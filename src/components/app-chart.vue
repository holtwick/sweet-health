<script lang="ts" setup>
import { useIntervalFn, useLocalStorage, useWindowSize } from '@vueuse/core'
import type { ApexOptions } from 'apexcharts'
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight, CalendarPlus } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { arrayAvg, arrayMax, arrayMin, arraySum, first, getTimestamp, roundArrayOfNumbersToMatchSum, sortedOrderby } from 'zeed'
import ApexChart from './apex-chart.vue'
import { openEditDialog } from '@/ui/use-edit'
import AppEditEvent from '@/ui/app-edit-event.vue'
import { type HealthDataPoint, trendSymbols } from '@/services/_types'
import { api } from '@/api'

import './app-chart.styl'

// const dataValues = data.value ?? { points: [], events: [] }

const hours = useLocalStorage('health.hours', 24)

const currentPoints = computed(() => sortedOrderby(api.data.points.filter(item => item.ts >= getTimestamp() - hours.value * 60 * 60 * 1000), 'ts desc'))
const currentEvents = computed(() => sortedOrderby(Object.values(api.data.events).filter(item => item.ts >= getTimestamp() - hours.value * 60 * 60 * 1000), 'ts desc'))

const currentEntry = computed<HealthDataPoint | undefined>(() => first(currentPoints.value))
const currentValue = computed(() => currentEntry.value?.value ?? 0)
const currentTrend = computed(() => trendSymbols[currentEntry.value?.trend ?? '0'])
const currentAvg = computed(() => arrayAvg(currentPoints.value.map(p => p.value)))

const header = ref()

const { height: windowHeight } = useWindowSize()

const options = computed<ApexOptions>(() => {
  function roundStepTop(value: number, step = 20, min = 120) {
    return Math.max(min, Math.ceil((value + step / 3) / step) * step)
  }

  function roundStepDown(value: number, step = 20, min = 80) {
    return Math.min(min, Math.floor((value - step / 3) / step) * step)
  }

  const gdata = currentPoints.value as unknown as HealthDataPoint[]
  const data = gdata.map(e => ([e.ts, e.value]))

  const minValue = roundStepDown(arrayMin(data.map(d => d[1])))
  const maxValue = roundStepTop(arrayMax(data.map(d => d[1])))

  const headerHeight = header.value ? Number.parseInt(window.getComputedStyle(header.value).height) : 0
  const height = Math.max(250, (windowHeight.value - headerHeight)) - 32

  return {
    series: [
      {
        name: 'mg/dl',
        data,
      },
    ],
    // theme: {
    //   mode: 'dark',
    // },
    chart: {
      type: 'line',
      height: '100%',
      zoom: {
        enabled: false,
      },
      // dropShadow: {
      //   enabled: true,
      //   color: '#000',
      //   top: 18,
      //   left: 7,
      //   blur: 10,
      //   opacity: 0.2,
      // },
      // background: 'yellow',
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      x: {
        show: true,
        format: 'HH:mm:ss',
      },
    },
    annotations: {

      xaxis: currentEvents.value.map((e) => {
        return {
          x: e.ts,
          borderColor: '#00f',
          borderWidth: 2,
          strokeDashArray: undefined,
        }
      }),
      yaxis: [
        {
          y: 100,
          borderColor: '#00E396',
          borderWidth: 2,
          strokeDashArray: undefined,
        },
        {
          y: 140,
          borderColor: 'orange',
          borderWidth: 1,
          // strokeDashArray: undefined,
        },
        {
          y: currentAvg.value,
          borderColor: 'blue',
          borderWidth: 1,
          // strokeDashArray: undefined,
        },
        {
          y: 0,
          y2: 55,
          borderColor: '#000',
          fillColor: 'red',
          opacity: 0.5,
          strokeDashArray: undefined,
        },
        {
          y: 55,
          y2: 70,
          borderColor: '#000',
          fillColor: 'red',
          opacity: 0.25,
          strokeDashArray: undefined,
        },
        {
          y: 180,
          y2: 250,
          borderColor: '#000',
          fillColor: 'orange',
          opacity: 0.25,
        },
        {
          y: 250,
          y2: 1000,
          borderColor: '#000',
          fillColor: 'orange',
          opacity: 0.5,
        },
      ],
    },
    colors: ['#000000'],
    // dataLabels: {
    //   enabled: true,
    //   distributed: true,
    // },
    // title: {
    //   text: 'Aktuelle Werte',
    //   align: 'center',
    // },
    grid: {
      position: 'back',
      borderColor: '#e7e7e7',
      // row: {
      //   colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      //   opacity: 0.5,
      // },
    },
    stroke: {
      position: 'front',
      show: true,
      colors: ['#888'],
      curve: 'smooth',
    },
    markers: {
      position: 'front',
      strokeWidth: 0,
      colors: ['#000'],
      size: 2,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
      },
    },
    yaxis: {
      min: minValue,
      max: maxValue,
      stepSize: 10,
      labels: {
        show: true,
      },
    },
  } as ApexOptions
})

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

async function doAddEvent() {
  openEditDialog(AppEditEvent)
}

const now = ref(getTimestamp())
useIntervalFn(() => now.value = getTimestamp(), 1e3)
const currentTimeAgo = computed(() => Math.round((now.value - (currentEntry.value?.ts ?? 0)) / 60e3))
</script>

<template>
  <div ref="header" class="header">
    <div class="date">
      {{ new Date(currentEntry?.ts ?? 0).toLocaleTimeString('de') }} Uhr
      -
      <span :key="now">{{ currentTimeAgo < 1 ? 'jetzt' : `${currentTimeAgo} min` }}</span>
      -
      {{ currentPercentages[2] }} % im Zielbereich
    </div>
    <div class="value">
      <template v-if="currentEntry?.trend != null ">
        <span class="trend" :data-trend="currentEntry?.trend">
          <ArrowUp v-if="currentEntry.trend > 2" />
          <ArrowUp v-if="currentEntry.trend > 1" />
          <ArrowUpRight v-else-if="currentEntry.trend === 1" />
          <ArrowRight v-else-if="currentEntry.trend === 0" />
          <ArrowDownRight v-else-if="currentEntry.trend === -1" />
          <ArrowDown v-else-if="currentEntry.trend < -1" />
          <ArrowDown v-else-if="currentEntry.trend < -2" />
          <!-- {{ currentTrend }} -->
        </span>
      </template>
      {{ currentValue }} mg/dl

      <div class="datebutton" @click="doAddEvent">
        <CalendarPlus />
      </div>
    </div>
  </div>

  <div class="chart">
    <ApexChart :options="options" />
  </div>

  <div class="table">
    <input v-model="hours" type="range" min="1" max="24" step="1">
    &nbsp;
    {{ hours }} Stunden
  </div>
</template>
