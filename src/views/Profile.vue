<template>
  <div class="home">
    <div class="row">
      <div class="col-12 col-lg-6">
        <div id="chart"></div>
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
  #chart {
    overflow: hidden;
  }
</style>

<script setup>
import ApexCharts from 'apexcharts';
import Table from '@/components/Table.vue';
import {
  onMounted, onBeforeUnmount, ref,
} from 'vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import PubSub from 'pubsub-js';

const user = auth.getCurrentUser();
const weightAndNeatTable = new DataService(`weightAndNeat/${user.uid}`);
let chart;
let tableData;
let pubSubToken;

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

const options = {
  chart: {
    type: 'line',
    toolbar: {
      show: false,
      offsetX: 0,
      offsetY: 0,
      tools: {
        download: false,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
        customIcons: [],
      },
      autoSelected: 'zoom',
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      animateGradually: {
        enabled: true,
      },
      dynamicAnimation: {
        enabled: true,
      },
    },
  },
  stroke: {
    curve: 'smooth',
  },
  zoom: {
    enabled: false,
  },
  colors: ['#01579b'],
  series: [],
  xaxis: {
    tooltip: {
      enabled: false,
    },
  },
  noData: {
    text: 'Laden...',
  },
};

function updateData(data) {
  const recordsToAddChart = [];
  const recordsToAddTable = [];
  if (data) {
    Object.entries(data).forEach((record) => {
      if (record[0] >= window.aiofGlobalDateFrom && record[0] <= window.aiofGlobalDateTo) {
        recordsToAddChart.push({
          x: record[1].date,
          y: record[1].weight,
        });

        recordsToAddTable.push({
          date: record[1].date,
          weight: record[1].weight,
          steps: record[1].steps,
        });
      }
    });
  }

  if (recordsToAddChart.length <= 0) {
    document.querySelector('#chart text').innerHTML = 'Keine Daten gefunden';
  }

  chart.updateSeries([{
    name: 'Gewicht',
    data: recordsToAddChart,
  }]);

  rows.value = recordsToAddTable;
}

function dataRecieved(data) {
  updateData(data);
  tableData = data;
}

// TODO Change from ApexCharts to GoogleCharts?
onMounted(() => {
  chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
  weightAndNeatTable.listenOn(dataRecieved);

  pubSubToken = PubSub.subscribe('date.changed', () => {
    updateData(tableData);
  });
});

onBeforeUnmount(() => {
  chart.destroy();

  PubSub.unsubscribe(pubSubToken);
});
</script>
