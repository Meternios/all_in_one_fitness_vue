<template>
  <div class="about">
    <div class="row">
      <div class="col-12 col-lg-6">
        <Chart :chartData="chartData" :chartOptions="chartOptions" chartType="Bar"
        :height="250"/>
      </div>
      <div class="col-12 col-lg-6 q-mt-md">
        <Table
          :paginationSetting="paginationSetting"
          :columns="columns"
          :rows="rows"
          modalTitle="Heutige Makronährstoffe"
          @on-input-update="calculateCalories"
          :table="nutritionTable"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Table from '@/components/Table.vue';
import Chart from '@/components/Chart.vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import PubSub from 'pubsub-js';

let pubSubToken;
let dbData;
const chartData = ref({
  labels: [],
  datasets: [{
    data: [],
    borderColor: '#01579b',
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
      callbacks: {
        label(tooltipItem) {
          return `${tooltipItem.dataset.label}: ${tooltipItem.raw / ((tooltipItem.datasetIndex !== 2) ? 4 : 9)}g`;
        },
      },
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
      stacked: true,
    },
    x: {
      grid: {
        display: false,
      },
      stacked: true,
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
    name: 'calories',
    align: 'right',
    label: 'Kcal',
    field: 'number',
    disabled: true,
    noValidation: true,
  },
  {
    name: 'protein',
    align: 'right',
    label: 'EW (g)',
    field: 'number',
    focus: true,
    handleOnUpdate: true,
  },
  {
    name: 'carbohydrates',
    align: 'right',
    label: 'KH (g)',
    field: 'number',
    handleOnUpdate: true,
  },
  {
    name: 'fat',
    align: 'right',
    label: 'F (g)',
    field: 'number',
    handleOnUpdate: true,
  },
]);
const user = auth.getCurrentUser();
const nutritionTable = new DataService(`nutrition/${user.uid}`);
const paginationSetting = {
  rowsPerPage: 7,
};

function parseMacro(value) {
  return value !== '' && value !== null && value !== undefined
    ? parseFloat(value, 0)
    : 0;
}

function calculateCalories(form) {
  const calories = (parseMacro(form.carbohydrates) + parseMacro(form.protein)) * 4
    + parseMacro(form.fat) * 9;

  columns.value[1].value = calories;
}

function updateData(data) {
  const recordsToAdd = [];
  const recordsToAddChart = [
    {
      label: 'Protein',
      data: [],
      backgroundColor: '#01579b',
    },
    {
      label: 'Kohlenhydrate',
      data: [],
      backgroundColor: '#4f83cc',
    },
    {
      label: 'Fett',
      data: [],
      backgroundColor: '#002f6c',
    },
  ];
  const labelsToAddChart = [];
  if (data) {
    Object.entries(data).forEach((record) => {
      if (
        record[0] >= window.aiofGlobalDateFrom
        && record[0] <= window.aiofGlobalDateTo
      ) {
        recordsToAdd.push({
          date: record[1].date,
          calories: record[1].calories,
          protein: record[1].protein,
          carbohydrates: record[1].carbohydrates,
          fat: record[1].fat,
        });
        labelsToAddChart.push(record[1].date);
        recordsToAddChart[0].data.push(record[1].protein * 4);
        recordsToAddChart[1].data.push(record[1].carbohydrates * 4);
        recordsToAddChart[2].data.push(record[1].fat * 9);
      }
    });
  }

  chartData.value.labels = labelsToAddChart;
  chartData.value.datasets = recordsToAddChart;
  rows.value = recordsToAdd;
}

function dataRecieved(data) {
  updateData(data);
  dbData = data;
}

onBeforeMount(() => {
  nutritionTable.listenOn(dataRecieved);

  pubSubToken = PubSub.subscribe('date.changed', () => {
    updateData(dbData);
  });
});

onBeforeUnmount(() => {
  PubSub.unsubscribe(pubSubToken);
});
</script>
