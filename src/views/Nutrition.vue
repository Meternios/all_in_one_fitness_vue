<template>
  <div class="about">
    <Table
      :paginationSetting="paginationSetting"
      :columns="columns"
      :rows="rows"
      modalTitle="Heutige Makronährstoffe"
      @on-input-update="calculateCalories"
      :table="nutritionTable"
    />
  </div>
</template>

<script setup>
import Table from '@/components/Table.vue';
import DataService from '@/api/dataService';
import auth from '@/api/authentication';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import PubSub from 'pubsub-js';

let pubSubToken;
let tableData;
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
      }
    });

    rows.value = recordsToAdd;
  } else {
    rows.value = recordsToAdd;
  }
}

function dataRecieved(data) {
  updateData(data);
  tableData = data;
}

onBeforeMount(() => {
  nutritionTable.listenOn(dataRecieved);

  pubSubToken = PubSub.subscribe('date.changed', () => {
    updateData(tableData);
  });
});

onBeforeUnmount(() => {
  PubSub.unsubscribe(pubSubToken);
});
</script>
