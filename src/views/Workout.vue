<template>
  <div class="workout">
    <div class="row">
      <div class="col-12 col-lg-6">
        <Chart :chartData="chartData" :chartOptions="chartOptions" chartType="Line"
        :height="250"/>
      </div>
      <div class="col-12 col-lg-6 q-mt-md">
        <List
          :columns="columns"
          :rows="rows"
          modalTitle="Heutiges Gewicht"
          :table="weightAndNeatTable"
          :bottomRow="bottomRow"
          :paginationSetting="paginationSetting"
          @on-pagination-change="updateList"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>

<script setup>
import List from '@/components/List.vue';
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
const bottomRow = ref([]);
const paginationSetting = ref({ currentPage: 1, itemsPerSite: 7, totalPages: NaN });
let recordsToAddTable;

function updateList(currentPage) {
  paginationSetting.value.currentPage = currentPage;
  rows.value = recordsToAddTable.slice(
    (currentPage - 1) * paginationSetting.value.itemsPerSite,
    (currentPage - 1) * paginationSetting.value.itemsPerSite + paginationSetting.value.itemsPerSite,
  );
}

// TODO Optimize function
function updateData(data) {
  const chartRecords = { labels: [], data: [] };
  recordsToAddTable = [];
  let avgRecordToAdd = [{ value: 'Ø' }, { value: 0, length: 0 }, { value: 0, length: 0 }];
  if (data) {
    Object.entries(data).forEach((record) => {
      if (record[0] >= window.aiofGlobalDateFrom && record[0] <= window.aiofGlobalDateTo) {
        chartRecords.labels.push(record[1].date);
        chartRecords.data.push(record[1].weight);

        if (!Number.isNaN(parseFloat(record[1].weight))) {
          avgRecordToAdd[1].value += record[1].weight;
          avgRecordToAdd[1].length += 1;
        }
        if (!Number.isNaN(parseInt(record[1].steps, 10))) {
          avgRecordToAdd[2].value += record[1].steps;
          avgRecordToAdd[2].length += 1;
        }

        recordsToAddTable.push({
          row: {
            date: record[1].date,
            weight: record[1].weight,
            steps: record[1].steps,
          },
          checked: false,
        });
      }
    });

    avgRecordToAdd[1].value /= avgRecordToAdd[1].length;
    if (avgRecordToAdd[2].value !== 0) {
      avgRecordToAdd[2].value /= avgRecordToAdd[2].length;
    } else {
      avgRecordToAdd[2].value = '';
    }
  }

  chartData.value.labels = chartRecords.labels;
  chartData.value.datasets[0].data = chartRecords.data;
  if (recordsToAddTable.length <= 0) {
    avgRecordToAdd = null;
  }
  bottomRow.value = avgRecordToAdd;
  updateList(paginationSetting.value.currentPage);
  paginationSetting.value.totalPages = Math.ceil(recordsToAddTable.length / 7);
}

function dataRecieved(data) {
  updateData(data);
  dbData = data;
}

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
