<template>
  <div class="about">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="name"
      binary-state-sort
      v-model:pagination="pagination"
      @row-click="clickedRow"
    >
    </q-table>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="showModal" aria-label="Makronährstoffe hinzufügen"/>
    </q-page-sticky>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Heutige Makronährstoffe</div>
        </q-card-section>

        <q-form @submit="addMacros">
          <q-card-section class="q-pt-none">
            <q-input dense v-model="addCalories" type="number" disable label="Kalorien"/>
            <q-input dense v-model="addProtein" step=".1"
            type="number" autofocus @update:model-value="calculateCalories" label="Protein"/>
            <q-input dense v-model="addCarbohydrates" step=".1"
            type="number" @update:model-value="calculateCalories" label="Kohlenhydrate"/>
            <q-input dense v-model="addFat" step=".1"
            type="number" @update:model-value="calculateCalories" label="Fett"/>
            <q-input v-model="addDate" label="Datum">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" cover transition-show="scale"
                  transition-hide="scale">
                    <q-date v-model="addDate" mask="DD.MM.YYYY" @click="hideCalendar">
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

<script setup>
import {
  ref, onBeforeMount, onBeforeUnmount,
} from 'vue';
import PubSub from 'pubsub-js';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { useQuasar } from 'quasar';

dayjs.extend(customParseFormat);

const paginationSetting = {
  rowsPerPage: 7,
};

const columns = [
  {
    name: 'date',
    label: 'Datum',
    align: 'left',
    field: 'date',
  },
  {
    name: 'calories', align: 'right', label: 'Kcal', field: 'calories',
  },
  {
    name: 'protein', align: 'right', label: 'EW (g)', field: 'protein',
  },
  {
    name: 'carbohydrates', align: 'right', label: 'KH (g)', field: 'carbohydrates',
  },
  {
    name: 'fat', align: 'right', label: 'F (g)', field: 'fat',
  },
];

const qDateProxy = ref();
const user = auth.getCurrentUser();
const tableUser = new DataService(`nutrition/${user.uid}`);
const rows = ref();
const pagination = ref(paginationSetting);
const today = dayjs().format('DD.MM.YYYY');
const prompt = ref(false);
const addCalories = ref();
const addCarbohydrates = ref();
const addDate = ref(today);
const addFat = ref();
const addProtein = ref();
const $q = useQuasar();
let pubSubToken;
let tableData;

function updateData(data) {
  const recordsToAdd = [];
  if (data) {
    Object.entries(data).forEach((record) => {
      if (record[0] >= window.aiofGlobalDateFrom && record[0] <= window.aiofGlobalDateTo) {
        recordsToAdd.push({
          date: record[1].date,
          calories: record[1].calories,
          protein: record[1].protein,
          carbohydrates: record[1].carbohydrates,
          fat: record[1].fat,
        });
      }
    });

    rows.value = recordsToAdd;
  }
}

function showModal() {
  prompt.value = true;
  addCalories.value = '';
  addCarbohydrates.value = '';
  addDate.value = today;
  addFat.value = '';
  addProtein.value = '';
}

function dataRecieved(data) {
  updateData(data);
  tableData = data;
}

function checkIfMacroValid(value) {
  return parseInt(value, 0) > 0 && parseInt(value, 0) < 10000;
}

function parseMacro(value) {
  return (value !== '' && value !== null && value !== undefined) ? parseFloat(value, 0) : 0;
}

function calculateCalories() {
  addCalories.value = (parseMacro(addCarbohydrates.value) + parseMacro(addProtein.value)) * 4
  + parseMacro(addFat.value) * 9;
}

function addMacros() {
  const tempDate = dayjs(addDate.value, 'DD.MM.YYYY', true);

  if (checkIfMacroValid(addCalories.value) && checkIfMacroValid(addFat.value)
  && checkIfMacroValid(addCarbohydrates.value) && checkIfMacroValid(addProtein.value) && tempDate.isValid()) {
    tableUser.create({
      calories: addCalories.value,
      protein: addProtein.value,
      fat: addFat.value,
      carbohydrates: addCarbohydrates.value,
      date: addDate.value,
    }, `nutrition/${user.uid}/${tempDate.format('YYYYMMDD')}`)
      .then(() => {
        prompt.value = false;
        addCalories.value = '';
        addFat.value = '';
        addCarbohydrates.value = '';
        addProtein.value = '';
        addDate.value = today;

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
  } else {
    $q.notify({
      message: 'Ein Fehler ist passiert, bitte überprüfe deine Daten und versuche es erneut.',
      position: 'top-right',
      type: 'negative',
      progress: true,
    });
  }
}

function hideCalendar(e) {
  if (e.target.closest('.q-date__calendar-days-container') !== null) {
    qDateProxy.value.hide();
  }
}

function clickedRow(evt, row) {
  prompt.value = true;
  addCalories.value = row.calories;
  addCarbohydrates.value = row.carbohydrates;
  addDate.value = row.date;
  addFat.value = row.fat;
  addProtein.value = row.protein;
}

onBeforeMount(() => {
  tableUser.listenOn(dataRecieved);

  pubSubToken = PubSub.subscribe('date.changed', () => {
    updateData(tableData);
  });
});

onBeforeUnmount(() => {
  PubSub.unsubscribe(pubSubToken);
});
</script>

<style lang="less">
.q-popup-edit__buttons {
  justify-content: flex-end;
}
</style>
