<template>
  <div class="aiof-table">
    <q-table
      :rows="propsFromParent.rows"
      :columns="propsFromParent.columns"
      row-key="date"
      binary-state-sort
      v-model:pagination="pagination"
      :selection="selectedRows && selectedRows.length > 0 ? 'multiple' : null"
      v-model:selected="selectedRows"
    >
      <template v-slot:body="props">
        <q-tr
          :props="props"
          @click="handleRowClick(props.row)"
          v-touch-pan.horizontal.prevent.mouse.mouseAllDir="
            selectedRows.length === 0
              ? (evt) => handleRowSwipe(evt, props)
              : false
          "
          v-touch-hold.mouse="(evt) => handleRowHold(props.row)"
        >
          <q-td key="checkbox" v-if="selectedRows && selectedRows.length > 0">
            <q-checkbox v-model="props.selected" dense />
          </q-td>
          <q-td
            v-for="(value, name) in props.row"
            :key="name"
            :class="
              typeof value === 'number' && !isNaN(value) ? 'text-right' : ''
            "
          >
            {{ value }}
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom v-if="selectedRows && selectedRows.length > 0">
        <div class="q-table__separator col"></div>
        <div class="q-table__control q-mr-sm">
          <div class="q-table__control__selected">
            {{ selectedRows.length }}
            {{
              selectedRows.length > 1
                ? "Reihen ausgewählt."
                : "Reihe ausgewählt."
            }}
          </div>
        </div>
        <div class="q-table__control">
          <q-btn
            outline
            color="primary"
            label="Bearbeiten"
            class="q-mr-sm"
            dense
            v-if="selectedRows && selectedRows.length == 1"
            @click="() => handleRowClick(selectedRows[0], true)"
          />
          <q-btn
            outline
            color="primary"
            label="Löschen"
            @click="() => deleteRow(selectedRows)"
            dense
          />
        </div>
      </template>
    </q-table>
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
              :step="(value.field === 'number') ? '.1' : null"
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
  paginationSetting: Object,
  columns: Array,
  rows: Array,
  modalTitle: String,
  table: DataService,
});

const emits = defineEmits(['onInputUpdate']);

const selectedRows = ref([]);
const qDateProxy = ref(false);
const pagination = ref(propsFromParent.paginationSetting);
const today = dayjs().format('DD.MM.YYYY');
const prompt = ref(false);
const $q = useQuasar();
const addOrEditLabel = ref('Hinzufügen');
const form = ref({ date: today });
const fabPos = ref([18, 18]);
const draggingFab = ref(false);

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true;

  fabPos.value = [
    fabPos.value[0] - ev.delta.x,
    fabPos.value[1] - ev.delta.y,
  ];
}

function handleOnUpdate() {
  emits('onInputUpdate', form.value);
  Object.values(propsFromParent.columns).forEach((record) => {
    if (record.value) {
      form.value[record.name] = record.value;
    }
  });
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
      form.value[record[0]] = parseFloat(form.value[record[0]]);
      if (form.value[record[0]] <= 0 || form.value[record[0]] > 9999) {
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

function handleRowClick(row, edit) {
  if (selectedRows.value.length === 0 || edit) {
    addOrEditLabel.value = 'Bearbeiten';
    prompt.value = true;

    Object.entries(row).forEach((record) => {
      const recordKey = record[0];
      const recordValue = record[1];
      form.value[recordKey] = recordValue;
    });
  } else {
    const arrayIndex = selectedRows.value.findIndex(
      (element) => element.date === row.date,
    );

    if (arrayIndex >= 0) {
      selectedRows.value.splice(arrayIndex, 1);
    } else {
      selectedRows.value.push(row);
    }

    if (selectedRows.value.length === 0) {
      window.setTimeout(() => {
        const array = document.querySelectorAll('.swipe-row-right');
        const arrayLength = array.length;

        for (let i = 0; i < arrayLength; i += 1) {
          if (!array[i].firstElementChild.classList.contains('text-left')) {
            array[i].firstElementChild.classList.add('background-red');
          }
        }
      }, 0);
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
    propsFromParent.table
      .delete(
        dayjs(allSelectedRows[i].date, 'DD.MM.YYYY', true).format('YYYYMMDD'),
      )
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

function handleRowSwipe(evt, props) {
  if (selectedRows.value.length === 0) {
    const isSwiping = evt.isFinal !== true && evt.isFirst !== true;
    const offsetTillDelete = 100;
    const swipingFinshed = evt.isFinal;
    const currentRow = document.querySelector(
      `.q-table tbody > tr:nth-child(${props.rowIndex + 1})`,
    );
    const array = document.querySelectorAll('.background-red');
    const arrayLength = array.length;
    if (arrayLength > 0) {
      for (let i = 0; i < arrayLength; i += 1) {
        array[i].classList.remove('background-red');
      }
    }

    if (isSwiping) {
      currentRow.style.transform = `translateX(${
        getOffset(currentRow).left + evt.delta.x
      }px)`;

      if (
        (getOffset(currentRow).left > offsetTillDelete
          || getOffset(currentRow).left < -1 * offsetTillDelete)
        && !currentRow.firstElementChild.classList.contains(
          'fade-background-red',
        )
        && !currentRow.lastElementChild.classList.contains('fade-background-red')
      ) {
        currentRow.firstElementChild.classList.add('fade-background-red');
        currentRow.lastElementChild.classList.add('fade-background-red');
      } else if (
        getOffset(currentRow).left <= offsetTillDelete
        && getOffset(currentRow).left >= -1 * offsetTillDelete
        && currentRow.firstElementChild.classList.contains(
          'fade-background-red',
        )
        && currentRow.lastElementChild.classList.contains('fade-background-red')
      ) {
        currentRow.firstElementChild.classList.remove('fade-background-red');
        currentRow.lastElementChild.classList.remove('fade-background-red');
      }
    }

    if (
      swipingFinshed
      && (getOffset(currentRow).left > offsetTillDelete
        || getOffset(currentRow).left < -1 * offsetTillDelete)
    ) {
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
          {
            label: 'Rückgänig',
            handler: () => {
              undoRemove(currentRow);
            },
          },
        ],
      });

      currentRow.dataset.removeTimeout = window.setTimeout(() => {
        currentRow.style.transform = 'translateX(0px)';
        currentRow.classList.remove('swipe-row-right');
        currentRow.style.removeProperty('transition');
        if (currentRow.querySelectorAll('.fade-background-red').length > 0) {
          currentRow
            .querySelectorAll('.fade-background-red')
            .forEach((el) => el.classList.remove('fade-background-red'));
        }
        propsFromParent.table.delete(
          dayjs(props.row.date, 'DD.MM.YYYY', true).format('YYYYMMDD'),
        );
      }, 6500);
    } else if (
      swipingFinshed
      && (getOffset(currentRow).left < offsetTillDelete
        || getOffset(currentRow).left > -1 * offsetTillDelete)
    ) {
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

function handleRowHold(row) {
  if (selectedRows.value == null) {
    selectedRows.value = [];
  }
  const arrayIndex = selectedRows.value.findIndex(
    (element) => element.date === row.date,
  );

  if (arrayIndex >= 0) {
    selectedRows.value.splice(arrayIndex, 1);
  } else {
    selectedRows.value.push(row);
  }

  window.setTimeout(() => {
    const array = document.querySelectorAll('.fade-background-red');
    const arrayLength = array.length;

    for (let i = 0; i < arrayLength; i += 1) {
      if (!array[i].classList.contains('text-left')) {
        array[i].previousElementSibling.classList.add('background-red');
        array[i].classList.remove('fade-background-red');
      }
    }
  }, 0);
}
</script>

<style lang="less" scoped>
.aiof-table ::v-deep {
  @keyframes bouncingLeft {
    50% {
      transform: translateX(0);
    }
    75% {
      transform: translateX(15px);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes bouncingRight {
    50% {
      transform: translateX(0);
    }
    75% {
      transform: translateX(-15px);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes circleBackgroundChange {
    0% {
      background: radial-gradient(circle, @black 0%, @black 100%);
    }
    25% {
      background: radial-gradient(
        circle,
        @negative 0%,
        @negative 25%,
        @black 100%
      );
    }
    50% {
      background: radial-gradient(
        circle,
        @negative 0%,
        @negative 50%,
        @black 100%
      );
    }
    75% {
      background: radial-gradient(
        circle,
        @negative 0%,
        @negative 75%,
        @black 100%
      );
    }
    100% {
      background: radial-gradient(circle, @negative 0%, @negative 100%);
    }
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

  .background-red:after {
    background: @negative !important;
  }

  .fade-background-red:after {
    animation-name: circleBackgroundChange;
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
  }

  .q-table__middle {
    overflow: hidden;
    user-select: none;

    .q-table th,
    .q-table td {
      padding: 7px 10px;
    }

    thead {
      .q-checkbox__inner {
        width: 18px;
        height: 18px;
        min-width: auto;
        .q-checkbox__bg {
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
            content: "";
            background: none;
          }
        }

        & > td:first-child:after,
        & > td:last-child:after {
          content: "delete_sweep";
          font-size: 30px;
          color: @white;
          font-family: "Material Icons";
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

        & > td:first-child:after {
          transform: translateX(-100%) scaleX(-1);
          left: 0;
        }

        & > td:last-child:after {
          left: 100%;
        }
      }
    }
  }
}
</style>
