<template>
  <div class="home">
    <div id="chart"></div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="prompt = true"/>
    </q-page-sticky>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Heutiges Gewicht</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="weight" type="number" autofocus/>
          <q-input v-model="date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" cover transition-show="scale"
                transition-hide="scale">
                  <q-date v-model="date" mask="DD.MM.YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Auswählen" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Abbrechen" v-close-popup />
          <q-btn flat label="Hinzufügen" @click="addWeight()" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="less">
  #chart {
    overflow: hidden;
  }
</style>

<script setup>
import ApexCharts from 'apexcharts';
import {
  onMounted, ref,
} from 'vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const user = auth.getCurrentUser();
const prompt = ref(false);
const weight = ref('');
const today = dayjs().format('DD.MM.YYYY');
const date = ref(today);
let chart;

const options = {
  chart: {
    type: 'line',
    toolbar: {
      show: false,
      offsetX: 0,
      offsetY: 0,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: false,
        zoomout: false,
        pan: true,
        reset: false,
        customIcons: [],
      },
      autoSelected: 'zoom',
    },
  },
  colors: ['#01579b'],
  series: [],
  xaxis: {
  },
  noData: {
    text: 'Laden...',
  },
};
const tableUser = new DataService(`weight/${user.uid}`);

function dataRecieved(data) {
  const recordsToAdd = [];
  Object.values(data).forEach((record) => {
    recordsToAdd.push({
      x: record.date,
      y: record.weight,
    });
  });

  chart.updateSeries([{
    name: 'Gewicht',
    data: recordsToAdd,
  }]);
}

function addWeight() {
  const tempDate = dayjs(date.value, 'DD.MM.YYYY');
  if (weight.value !== '' && tempDate.isValid()) {
    tableUser.create({ weight: weight.value, date: date.value }, `weight/${user.uid}/${tempDate.format('YYYYMMDD')}`)
      .then(() => {
        weight.value = '';
        date.value = today;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

onMounted(() => {
  chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
  tableUser.listenOn(dataRecieved);
});
</script>
