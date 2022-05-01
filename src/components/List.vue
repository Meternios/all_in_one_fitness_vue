<template>
  <div class="aiof-list">
    <q-list bordered separator>
      <q-item>
        <q-item-section
          v-if="
            propsFromParent.rows &&
            propsFromParent.rows.some((e) => e.checked === true)
          "
        >
          <q-checkbox
            v-model="allChecked"
            @update:model-value="checkAll"
            dense
          />
        </q-item-section>
        <q-item-section
          v-for="col in propsFromParent.columns"
          :key="col.name"
          :class="'text-' + col.align"
          >{{ col.label }}</q-item-section
        >
      </q-item>
      <q-slide-item
        left-color="negative"
        right-color="negative"
        v-for="data in propsFromParent.rows"
        :key="data.row.date"
        @left="({ reset }) => handleRowSwipe(data, reset)"
        @right="({ reset }) => handleRowSwipe(data, reset)"
      >
        <template v-slot:left>
          <q-icon name="delete_sweep" class="rotate180" />
        </template>
        <template v-slot:right>
          <q-icon name="delete_sweep" />
        </template>

        <q-item
          clickable
          v-ripple
          @click="handleRowClick(data)"
          v-touch-hold.mouse="(evt) => handleRowHold(data)"
        >
          <q-item-section
            v-if="
              propsFromParent.rows &&
              propsFromParent.rows.some((e) => e.checked === true)
            "
          >
            <q-checkbox v-model="data.checked" dense />
          </q-item-section>
          <q-item-section
            v-for="(value, name) in data.row"
            :key="name"
            :class="
              typeof value === 'number' && !isNaN(value) ? 'text-right' : ''
            "
          >
            {{ value }}
          </q-item-section>
        </q-item>
      </q-slide-item>
      <q-item
        v-if="
          propsFromParent.rows &&
          propsFromParent.rows.some((e) => e.checked === true)
        "
        class="justify-end"
      >
          <q-btn
            outline
            color="primary"
            label="Bearbeiten"
            class="q-mr-sm"
            dense
            v-if="propsFromParent.rows.filter(x => x.checked === true).length <= 1"
            @click="() => handleRowClick(propsFromParent.rows, true)"
          />
          <q-btn
            outline
            color="primary"
            label="Löschen"
            @click="deleteRow"
            dense
          />
      </q-item>
      <q-item v-else>
        <q-item-section
          v-for="(record, name) in propsFromParent.bottomRow"
          :key="name"
          :class="
            typeof record.value === 'number' && !isNaN(record.value)
              ? 'text-right'
              : ''
          "
          >{{ record.value }}</q-item-section
        >
      </q-item>
    </q-list>
    <q-page-sticky position="bottom-right" :offset="fabPos">
      <q-btn
        fab
        icon="add"
        color="accent"
        @click="showModal"
        aria-label="Hinzufügen"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      />
    </q-page-sticky>
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ propsFromParent.modalTitle }}</div>
        </q-card-section>

        <q-form @submit="addRow">
          <q-card-section class="q-pt-none">
            <q-input
              v-for="value in columns"
              :key="value.name"
              :type="value.field"
              :label="value.label"
              :disable="value.disabled"
              :autofocus="value.focus"
              v-model="form[value.name]"
              :step="value.field === 'number' ? '.1' : null"
              @update:model-value="
                value.handleOnUpdate ? handleOnUpdate(value.value) : null
              "
            >
              <template v-slot:append v-if="value.field === 'datePicker'">
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    v-model="qDateProxy"
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="form[value.name]"
                      mask="DD.MM.YYYY"
                      @click="hideCalendar"
                    >
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Abbrechen" v-close-popup />
            <q-btn flat :label="addOrEditLabel" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import DataService from '@/api/dataService';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { useQuasar } from 'quasar';

dayjs.extend(customParseFormat);

const propsFromParent = defineProps({
  columns: Array,
  rows: Array,
  modalTitle: String,
  table: DataService,
  bottomRow: Array,
});

const emits = defineEmits(['onInputUpdate']);

const qDateProxy = ref(false);
const today = dayjs().format('DD.MM.YYYY');
const prompt = ref(false);
const $q = useQuasar();
const addOrEditLabel = ref('Hinzufügen');
const form = ref({ date: today });
const fabPos = ref([18, 18]);
const draggingFab = ref(false);
const noValidation = [];
const allChecked = ref(false);

Object.values(propsFromParent.columns).forEach((record) => {
  if ('noValidation' in record && record.noValidation === true) {
    noValidation.push(record.name);
  }
});

function checkAll() {
  const modifiedData = propsFromParent.rows;
  Object.keys(modifiedData).forEach((key) => {
    if (allChecked.value === true) {
      modifiedData[key].checked = true;
    } else {
      modifiedData[key].checked = false;
    }
  });
}

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true;
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y];
}

function handleOnUpdate() {
  emits('onInputUpdate', form.value);
  Object.values(propsFromParent.columns).forEach((record) => {
    if (record.value) {
      form.value[record.name] = record.value;
    }
  });
}

function handleRowClick(data, rowsSelected) {
  const modifiedData = data;
  if (
    propsFromParent.rows
    && propsFromParent.rows.some((e) => e.checked === true)
    && !rowsSelected
  ) {
    if (data.checked === true) {
      modifiedData.checked = false;
    } else {
      modifiedData.checked = true;
    }
  } else {
    addOrEditLabel.value = 'Bearbeiten';
    prompt.value = true;
    const selectedRow = (rowsSelected) ? Object.values(modifiedData).find((k) => k.checked === true) : data;

    Object.entries(selectedRow.row).forEach((row) => {
      const recordKey = row[0];
      const recordValue = row[1];
      form.value[recordKey] = recordValue;
    });
  }
}

function handleRowHold(data) {
  const modifiedData = data;

  if (data.checked === true) {
    modifiedData.checked = false;
  } else {
    modifiedData.checked = true;
  }
}

function undoRemove(data, reset) {
  const modifiedData = data;
  window.clearTimeout(modifiedData.removeTimeout);
  delete modifiedData.removeTimeout;
  reset();
}

function handleRowSwipe(data, reset) {
  const modifiedData = data;
  $q.notify({
    message: 'Eintrag erfolgreich gelöscht.',
    position: 'top-right',
    type: 'warning',
    progress: true,
    group: false,
    actions: [
      {
        label: 'Rückgänig',
        handler: () => {
          undoRemove(data, reset);
        },
      },
    ],
  });

  modifiedData.removeTimeout = window.setTimeout(() => {
    propsFromParent.table.delete(
      dayjs(modifiedData.row.date, 'DD.MM.YYYY', true).format('YYYYMMDD'),
    );
  }, 6500);
}

function deleteRow() {
  for (let i = 0; i < propsFromParent.rows.length; i += 1) {
    if (propsFromParent.rows[i].checked === true) {
      propsFromParent.table
        .delete(
          dayjs(propsFromParent.rows[i].row.date, 'DD.MM.YYYY', true).format('YYYYMMDD'),
        )
        .then(() => {
          $q.notify({
            message: 'Eintrag erfolgreich gelöscht.',
            position: 'top-right',
            type: 'positive',
            progress: true,
          });
        });
    }
  }
}

function showModal() {
  addOrEditLabel.value = 'Hinzufügen';
  prompt.value = true;
  form.value = { date: today };
}

function checkIfValid(data) {
  let valid = true;
  Object.entries(data).forEach((record) => {
    if (record[0] !== 'date' && !Number.isNaN(parseFloat(record[1]))) {
      form.value[record[0]] = parseFloat(record[1]);
      if (
        (record[1] <= 0 || record[1] > 9999)
        && !noValidation.includes(record[0])
      ) {
        valid = false;
      }
    }
  });

  return valid;
}

function addRow() {
  const tempDate = dayjs(form.value.date, 'DD.MM.YYYY', true);

  if (tempDate.isValid() && checkIfValid(form.value)) {
    propsFromParent.table
      .create(
        form.value,
        `${propsFromParent.table.getDbString()}/${tempDate.format('YYYYMMDD')}`,
      )
      .then(() => {
        prompt.value = false;
        form.value = { date: today };

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
      message:
        'Ein Fehler ist passiert, bitte überprüfe deine Daten und versuche es erneut.',
      position: 'top-right',
      type: 'negative',
      progress: true,
    });
  }
}

function hideCalendar(e) {
  if (e.target.closest('.q-date__calendar-days-container') !== null) {
    qDateProxy.value = false;
  }
}
</script>

<style lang="less" scoped>
.rotate180 {
  transform: scaleX(-1);
}
</style>
