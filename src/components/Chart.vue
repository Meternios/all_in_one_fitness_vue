<template>
  <Bar v-if="propsFromParent.chartType === 'Bar'"
    :chart-options="propsFromParent.chartOptions"
    :chart-data="propsFromParent.chartData"
    :chart-id="propsFromParent.chartId"
    :dataset-id-key="propsFromParent.datasetIdKey"
    :plugins="propsFromParent.plugins"
    :css-classes="propsFromParent.cssClasses"
    :styles="propsFromParent.styles"
    :width="propsFromParent.width"
    :height="propsFromParent.height"
  />
  <Line v-if="propsFromParent.chartType === 'Line'"
    :chart-options="propsFromParent.chartOptions"
    :chart-data="propsFromParent.chartData"
    :chart-id="propsFromParent.chartId"
    :dataset-id-key="propsFromParent.datasetIdKey"
    :plugins="propsFromParent.plugins"
    :css-classes="propsFromParent.cssClasses"
    :styles="propsFromParent.styles"
    :width="propsFromParent.width"
    :height="propsFromParent.height"
  />
</template>

<script setup>
import {
  defineProps,
} from 'vue';
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

// Todo Unique id with getCurrentInstance().uid
const propsFromParent = defineProps({
  chartType: {
    type: String,
    default: 'Bar',
  },
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    required: true,
  },
  chartId: {
    type: String,
    default: 'bar-chart',
  },
  datasetIdKey: {
    type: String,
    default: 'label',
  },
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 400,
  },
  cssClasses: {
    default: '',
    type: String,
  },
  styles: {
    type: Object,
    default: () => {},
  },
  plugins: {
    type: Object,
    default: () => {},
  },
});
</script>

<style lang="less" scoped>

</style>
