<template>
  <div class="about">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="date"
      binary-state-sort
      v-model:pagination="pagination"
      :selection="(selectedRows && selectedRows.length > 0) ? 'multiple' : null"
      v-model:selected="selectedRows"
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click="clickedRow(props.row)"
        v-touch-pan.horizontal.prevent.mouse="(evt) => handleRowSwipe(evt, props)"
        v-touch-hold.mouse="(evt) => handleRowHold(props)">
          <q-td key="checkbox" v-if="selectedRows && selectedRows.length > 0">
            <q-checkbox v-model="props.selected" dense/>
          </q-td>
          <q-td key="date" :props="props">
            {{ props.row.date }}
          </q-td>
          <q-td key="calories" :props="props">
            {{ props.row.calories }}
          </q-td>
          <q-td key="protein" :props="props">
            {{ props.row.protein }}
          </q-td>
          <q-td key="carbohydrates" :props="props">
            {{ props.row.carbohydrates }}
          </q-td>
          <q-td key="fat" :props="props">
            {{ props.row.fat }}
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom v-if="selectedRows && selectedRows.length > 0">
          <div class="q-table__separator col"></div>
          <div class="q-table__control q-mr-sm">
            <div class="q-table__control__selected">
              {{selectedRows.length}} {{(selectedRows.length > 1) ? 'Reihen ausgewählt.' : 'Reihe ausgewählt.'}}
            </div>
          </div>
          <div class="q-table__control">
            <q-btn outline color="primary" label="Bearbeiten" class="q-mr-sm" dense
            v-if="selectedRows && selectedRows.length == 1" @click="() => clickedRow(selectedRows[0], true)"/>
            <q-btn outline color="primary" label="Löschen" @click="() => deleteRow(selectedRows)" dense/>
          </div>
      </template>
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
            <q-btn flat :label="addOrEditLabel" type="submit"/>
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

const selectedRows = ref([]);
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
const addOrEditLabel = ref('Hinzufügen');
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
  } else {
    rows.value = recordsToAdd;
  }
}

function showModal() {
  addOrEditLabel.value = 'Hinzufügen';
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

  if (checkIfMacroValid(addFat.value)
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

function clickedRow(row, edit) {
  if (selectedRows.value.length === 0 || edit) {
    addOrEditLabel.value = 'Bearbeiten';
    prompt.value = true;
    addCalories.value = row.calories;
    addCarbohydrates.value = row.carbohydrates;
    addDate.value = row.date;
    addFat.value = row.fat;
    addProtein.value = row.protein;
  } else {
    const arrayIndex = selectedRows.value.findIndex((element) => element.date === row.date);

    if (arrayIndex >= 0) {
      selectedRows.value.splice(arrayIndex, 1);
    } else {
      selectedRows.value.push(row);
    }
  }
}

function undoRemove(row) {
  const currentRow = row;
  window.clearTimeout(row.dataset.removeTimeout);
  currentRow.style.transform = 'translateX(0)';
  currentRow.classList.remove('swipe-row-right', 'swipe-row-left');
  window.setTimeout(() => {
    currentRow.style.removeProperty('transition');
    currentRow.firstElementChild.classList.remove('fade-background-red');
    currentRow.lastElementChild.classList.remove('fade-background-red');
  }, 1000);
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

function deleteRow(allSelectedRows) {
  for (let i = 0; i < allSelectedRows.length; i += 1) {
    tableUser.delete(dayjs(allSelectedRows[i].date, 'DD.MM.YYYY', true).format('YYYYMMDD'))
      .then(() => {
        $q.notify({
          message: 'Eintrag erfolgreich gelöscht.',
          position: 'top-right',
          type: 'positive',
          progress: true,
        });
      });

    selectedRows.value = [];
  }
}

function handleRowSwipe(evt, row) {
  if (selectedRows.value.length === 0) {
    const isSwiping = evt.isFinal !== true && evt.isFirst !== true;
    const offsetTillDelete = 100;
    const swipingFinshed = evt.isFinal;
    const currentRow = document.querySelector(`.q-table tbody > tr:nth-child(${row.rowIndex + 1})`);
    if (isSwiping) {
      currentRow.style.transform = `translateX(${getOffset(currentRow).left + evt.delta.x}px)`;

      if ((getOffset(currentRow).left > offsetTillDelete
        || getOffset(currentRow).left < (-1) * offsetTillDelete)
        && !currentRow.firstElementChild.classList.contains('fade-background-red')
        && !currentRow.lastElementChild.classList.contains('fade-background-red')) {
        currentRow.firstElementChild.classList.add('fade-background-red');
        currentRow.lastElementChild.classList.add('fade-background-red');
      } else if ((getOffset(currentRow).left <= offsetTillDelete
        && getOffset(currentRow).left >= (-1) * offsetTillDelete)
        && currentRow.firstElementChild.classList.contains('fade-background-red')
        && currentRow.lastElementChild.classList.contains('fade-background-red')) {
        currentRow.firstElementChild.classList.remove('fade-background-red');
        currentRow.lastElementChild.classList.remove('fade-background-red');
      }
    }

    if (swipingFinshed && (getOffset(currentRow).left > offsetTillDelete
    || getOffset(currentRow).left < (-1) * offsetTillDelete)) {
      currentRow.style.transition = 'transform 0.4s';
      if (evt.direction === 'right') {
        currentRow.classList.add('swipe-row-right');
      } else {
        currentRow.classList.add('swipe-row-left');
      }

      $q.notify({
        message: 'Eintrag erfolgreich gelöscht.',
        position: 'top-right',
        type: 'warning',
        progress: true,
        group: false,
        actions: [
          { label: 'Rückgänig', handler: () => { undoRemove(currentRow); } },
        ],
      });

      currentRow.dataset.removeTimeout = window.setTimeout(() => {
        currentRow.style.transform = 'translateX(0px)';
        tableUser.delete(dayjs(row.row.date, 'DD.MM.YYYY', true).format('YYYYMMDD'));
      }, 6500);
    } else if (swipingFinshed && (getOffset(currentRow).left < offsetTillDelete
    || getOffset(currentRow).left > (-1) * offsetTillDelete)) {
      if (evt.direction === 'right') {
        currentRow.classList.add('bounceLeft');
      } else {
        currentRow.classList.add('bounceRight');
      }

      window.setTimeout(() => {
        currentRow.style.transform = 'translateX(0)';
        currentRow.classList.remove('bounceRight', 'bounceLeft');
      }, 1000);
    }
  }
}

function handleRowHold(props) {
  if (selectedRows.value == null) {
    selectedRows.value = [];
  }
  selectedRows.value.push(rows.value[props.rowIndex]);

  window.setTimeout(() => {
    const array = document.querySelectorAll('.fade-background-red');
    const arrayLength = array.length;

    for (let i = 0; i < arrayLength; i += 1) {
      if (array[i].classList.contains('text-left')) {
        array[i].previousElementSibling.classList.add('background-red');
        array[i].classList.remove('fade-background-red');
      }
    }
  }, 0);
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

<!-- TODO Put table in a new component and make styles scoped -->
<style lang="less">
@keyframes bouncingLeft {
  50%  {transform: translateX(0)}
  75%  {transform: translateX(15px)}
  100% {transform: translateX(0)}
}

@keyframes bouncingRight {
  50%  {transform: translateX(0)}
  75%  {transform: translateX(-15px)}
  100% {transform: translateX(0)}
}

@keyframes circleBackgroundChange {
  0%  {background: radial-gradient(circle, @black 0%, @black 100%);}
  25%  {background: radial-gradient(circle, @negative 0%, @negative 25%, @black 100%);}
  50%  {background: radial-gradient(circle, @negative 0%, @negative 50%, @black 100%);}
  75%  {background: radial-gradient(circle, @negative 0%, @negative 75%, @black 100%);}
  100% {background: radial-gradient(circle, @negative 0%, @negative 100%);}
}

.bounceLeft {
  animation-name: bouncingLeft;
  animation-duration: 0.4s;
  animation-fill-mode: forwards;
}

.bounceRight {
  animation-name: bouncingRight;
  animation-duration: 0.4s;
  animation-fill-mode: forwards;
}

.swipe-row-right {
  transform: translateX(100%) !important;
}

.swipe-row-left {
  transform: translateX(-100%) !important;
}

.background-red:after{
  background: @negative !important;
}

.fade-background-red:after {
  animation-name: circleBackgroundChange;
  animation-duration: 0.4s;
  animation-fill-mode: forwards;
}

.q-table__middle {
  overflow: hidden;

  .q-table th, .q-table td {
    padding: 7px 10px;
  }

  thead {
    .q-checkbox__inner {
      width: 18px;
      height: 18px;
      min-width: auto;
      .q-checkbox__bg{
        height: 100%;
        width: 100%;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
      }
    }
  }

  tbody {
    .q-tr {
      &.selected {
        background: rgba(0, 0, 0, 0.08);

        > td:after {
          content: '';
          background: none;
        }
      }

      & > td:first-child:after,
      & > td:last-child:after {
        content: "delete_sweep";
        font-size: 30px;
        color: @white;
        font-family: 'Material Icons';
        width: 50px;
        height: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        position: absolute;
        background-color: @black;
        width: 200vw;
        padding-left: 10px;
      }

      & > td:first-child:after{
        transform: translateX(-100%) scaleX(-1);
        left: 0;
      }

      & > td:last-child:after{
        left: 100%;
      }
    }
  }
}
</style>
