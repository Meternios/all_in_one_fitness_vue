<template>
  <div class="home">
    <div class="row">
      <div class="col-12 col-lg-6">
        <Chart :chartData="chartData" :chartOptions="chartOptions" chartType="Line"
        :height="250"/>
      </div>
      <div class="col-12 col-lg-6 q-mt-md">
        <Table
          :paginationSetting="paginationSetting"
          :columns="columns"
          :rows="rows"
          modalTitle="Heutiges Gewicht"
          :table="weightAndNeatTable"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>

<script setup>
import Table from '@/components/Table.vue';
import Chart from '@/components/Chart.vue';
import {
  onMounted, onBeforeUnmount, ref,
} from 'vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import PubSub from 'pubsub-js';

const user = auth.getCurrentUser();
const weightAndNeatTable = new DataService(`weightAndNeat/${user.uid}`);
let dbData;
let pubSubToken;
const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined);
const down = (ctx, value) => (ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined);
const chartData = ref({
  labels: [],
  datasets: [{
    data: [],
    tension: 0.4,
    borderColor: '#01579b',
    cubicInterpolationMode: 'monotone',
    spanGaps: true,
    segment: {
      borderColor: (ctx) => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
      borderDash: (ctx) => skipped(ctx, [6, 6]),
    },
  }],
});
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      multiKeyBackground: '#01579b',
    },
  },
  scales: {
    y: {
      ticks: {
        callback(val, index) {
          return index % 2 === 0 ? this.getLabelForValue(val) : '';
        },
      },
      grid: {
        display: false,
      },
    },
  },
});
const rows = ref();
const columns = ref([
  {
    name: 'date',
    label: 'Datum',
    align: 'left',
    field: 'datePicker',
  },
  {
    name: 'weight',
    align: 'right',
    label: 'Gewicht (kg)',
    field: 'number',
    focus: true,
  },
  {
    name: 'steps',
    align: 'right',
    label: 'Schritte',
    field: 'number',
    noValidation: true,
  },
]);
const paginationSetting = {
  rowsPerPage: 7,
};

function updateData(data) {
  const recordsToAddChart = [];
  const labelsToAddChart = [];
  const recordsToAddTable = [];
  if (data) {
    Object.entries(data).forEach((record) => {
      if (record[0] >= window.aiofGlobalDateFrom && record[0] <= window.aiofGlobalDateTo) {
        labelsToAddChart.push(record[1].date);
        recordsToAddChart.push(record[1].weight);

        recordsToAddTable.push({
          date: record[1].date,
          weight: record[1].weight,
          steps: record[1].steps,
        });
      }
    });
  }

  chartData.value.labels = labelsToAddChart;
  chartData.value.datasets[0].data = recordsToAddChart;
  rows.value = recordsToAddTable;
}

function dataRecieved(data) {
  updateData(data);
  dbData = data;
}

// TODO Change from ApexCharts to GoogleCharts?
onMounted(() => {
  weightAndNeatTable.listenOn(dataRecieved);

  pubSubToken = PubSub.subscribe('date.changed', () => {
    updateData(dbData);
  });
});

onBeforeUnmount(() => {
  PubSub.unsubscribe(pubSubToken);
});
</script>
