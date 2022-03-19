<template>
  <div class="home">
    <div class="row">
      <div class="col-12 col-lg-6">
        <div id="chart"></div>
      </div>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="prompt = true" aria-label="Gewicht hinzufügen"/>
    </q-page-sticky>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Heutiges Gewicht</div>
        </q-card-section>

        <q-form @submit="addWeight">
          <q-card-section class="q-pt-none">
            <q-input dense v-model="weight" step=".1" type="number" autofocus label="Gewicht"/>
            <q-input v-model="date" label="Datum">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" cover transition-show="scale"
                  transition-hide="scale">
                    <q-date v-model="date" mask="DD.MM.YYYY" @click="hideCalendar">
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Abbrechen" v-close-popup />
            <q-btn flat label="Hinzufügen" type="submit"/>
          </q-card-actions>
        </q-form>
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
  onMounted, ref, onBeforeUnmount,
} from 'vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { useQuasar } from 'quasar';
import PubSub from 'pubsub-js';

dayjs.extend(customParseFormat);

const user = auth.getCurrentUser();
const prompt = ref(false);
const weight = ref('');
const today = dayjs().format('DD.MM.YYYY');
const date = ref(today);
const $q = useQuasar();
const qDateProxy = ref();
let chart;
let chartData;
let pubSubToken;

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
const tableUser = new DataService(`weight/${user.uid}`);

function hideCalendar(e) {
  if (e.target.closest('.q-date__calendar-days-container') !== null) {
    qDateProxy.value.hide();
  }
}

function updateChart(data) {
  chartData = data;
  const recordsToAdd = [];
  if (data) {
    Object.entries(data).forEach((record) => {
      if (record[0] >= window.aiofGlobalDateFrom && record[0] <= window.aiofGlobalDateTo) {
        recordsToAdd.push({
          x: record[1].date,
          y: record[1].weight,
        });
      }
    });

    chart.updateSeries([{
      name: 'Gewicht',
      data: recordsToAdd,
    }]);

    if (recordsToAdd.length <= 0) {
      document.querySelector('#chart text').innerHTML = 'Keine Daten gefunden';
    }
  } else {
    document.querySelector('#chart text').innerHTML = 'Keine Daten gefunden';
  }
}

function dataRecieved(data) {
  updateChart(data);
}

function addWeight() {
  const tempDate = dayjs(date.value, 'DD.MM.YYYY', true);

  if (parseInt(weight.value, 0) > 0 && tempDate.isValid()) {
    tableUser.create({ weight: weight.value, date: date.value }, `weight/${user.uid}/${tempDate.format('YYYYMMDD')}`)
      .then(() => {
        prompt.value = false;
        weight.value = '';
        date.value = today;

        $q.notify({
          message: 'Eintrag erfolgreich hinzugefügt.',
          position: 'top-right',
          type: 'positive',
          progress: true,
        });
      })
      .catch((error) => {
        $q.notify({
          message: `Ein Fehler ist passiert, bitte überprüfe deine Daten und versuche es erneut. ${error.message}`,
          position: 'top-right',
          type: 'negative',
          progress: true,
        });
      });
  } else if (parseInt(weight.value, 0) === 0 && tempDate.isValid()) {
    tableUser.delete(`${tempDate.format('YYYYMMDD')}`)
      .then(() => {
        prompt.value = false;
        weight.value = '';
        date.value = today;

        $q.notify({
          message: 'Eintrag erfolgreich gelöscht.',
          position: 'top-right',
          type: 'positive',
          progress: true,
        });
      })
      .catch((error) => {
        $q.notify({
          message: `Ein Fehler ist passiert, bitte überprüfe deine Daten und versuche es erneut. ${error.message}`,
          position: 'top-right',
          type: 'negative',
          progress: true,
        });
      });
  } else {
    $q.notify({
      message: 'Ein Fehler ist passiert, bitte überprüfe deine Daten und versuche es erneut.',
      position: 'top-right',
      type: 'negative',
      progress: true,
    });
  }
}

onMounted(() => {
  chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
  tableUser.listenOn(dataRecieved);

  pubSubToken = PubSub.subscribe('date.changed', () => {
    updateChart(chartData);
  });
});

onBeforeUnmount(() => {
  chart.destroy();

  PubSub.unsubscribe(pubSubToken);
});
</script>
