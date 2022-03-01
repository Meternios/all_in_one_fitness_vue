<template>
  <div class="home">
    <div class="row">
      <div class="col-12 col-md-6">
        <div id="chart"></div>
      </div>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="prompt = true"/>
    </q-page-sticky>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Heutiges Gewicht</div>
        </q-card-section>

        <q-form @submit="addWeight()">
          <q-card-section class="q-pt-none">
            <q-input dense v-model="weight" step=".1" type="number" autofocus/>
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
  onMounted, ref,
} from 'vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { useQuasar } from 'quasar';

dayjs.extend(customParseFormat);

const user = auth.getCurrentUser();
const prompt = ref(false);
const weight = ref('');
const today = dayjs().format('DD.MM.YYYY');
const date = ref(today);
const $q = useQuasar();
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
  if (data) {
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
  } else {
    document.querySelector('#chart text').innerHTML = 'Keine Daten gefunden';
  }
}

function addWeight() {
  const tempDate = dayjs(date.value, 'DD.MM.YYYY', true);
  if (weight.value > 0 && tempDate.isValid()) {
    tableUser.create({ weight: weight.value, date: date.value }, `weight/${user.uid}/${tempDate.format('YYYYMMDD')}`)
      .then(() => {
        prompt.value = false;
        weight.value = '';
        date.value = today;
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
});
</script>
