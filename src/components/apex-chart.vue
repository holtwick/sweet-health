<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import ApexCharts from 'apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { LoggerInterface } from 'zeed'
import { Logger } from 'zeed'

const props = defineProps<{
  options: ApexOptions
  // series: ApexAxisChartSeries | undefined
}>()

const log: LoggerInterface = Logger('apex-chart')

const chartElement = ref<HTMLElement>()

let chart: ApexCharts | undefined

function getChart() {
  if (chart)
    return chart
  chart = new ApexCharts(chartElement.value, props.options)
  chart.render()
  return chart
}

onMounted(getChart)

watch(
  () => props.options,
  (options) => {
    chart?.updateOptions(options)
  },
  { deep: true },
)
</script>

<template>
  <div ref="chartElement" />
</template>
