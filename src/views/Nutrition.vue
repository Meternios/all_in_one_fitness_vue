<template>
  <div class="about">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="name"
      binary-state-sort
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="date" :props="props">
            {{ props.row.date }}
            <q-popup-edit v-model="props.row.date" v-slot="scope">
              <q-input v-model="scope.value" dense autofocus counter />
            </q-popup-edit>
          </q-td>
          <q-td key="calories" :props="props">
            {{ props.row.calories }}
            <q-popup-edit v-model="props.row.calories" title="Update calories" buttons v-slot="scope">
              <q-input type="number" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="protein" :props="props">
            {{ props.row.protein }}
            <q-popup-edit v-model="props.row.protein" title="Update carbs" buttons persistent v-slot="scope">
              <q-input type="number" v-model="scope.value" dense autofocus hint="Use buttons to close" />
            </q-popup-edit>
          </q-td>
          <q-td key="carbohydrates" :props="props">
            {{ props.row.carbohydrates }}
            <q-popup-edit v-model="props.row.carbohydrates" title="Update carbs" buttons persistent v-slot="scope">
              <q-input type="number" v-model="scope.value" dense autofocus hint="Use buttons to close" />
            </q-popup-edit>
          </q-td>
          <q-td key="fat" :props="props">
            <div class="text-pre-wrap">{{ props.row.fat }}</div>
            <q-popup-edit v-model="props.row.fat" v-slot="scope">
              <q-input type="textarea" v-model="scope.value" dense autofocus />
            </q-popup-edit>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
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

const rows = [
  {
    date: '21.03.2022',
    calories: 159,
    protein: 6,
    carbohydrates: 24,
    fat: 4,
  },
];
</script>
