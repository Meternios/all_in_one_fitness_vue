<template>
  <q-layout view="hHh lpR fFf" v-if="signedIn === true">
    <q-header reveal elevated class="bg-primary text-white q-pa-sm">
      <q-toolbar>
        <q-toolbar-title>
          {{$route.name}}
        </q-toolbar-title>
        <q-btn icon="event" flat aria-label="Zeitspanne">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="date" mask="DD.MM.YYYY" range>
              <div class="row items-center justify-end q-gutter-sm">
                <q-btn label="Abbrechen" color="primary" flat v-close-popup />
                <q-btn label="OK" color="primary" flat @click="updateDate" v-close-popup />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </q-toolbar>
    </q-header>

    <main class="q-main">
      <q-page-container>
        <router-view />
      </q-page-container>
    </main>

    <q-footer elevated class="bg-primary">
      <nav class="nav">
        <q-btn-group spread>
          <q-btn to="/" :class="{ active: $route.name === 'Profil' }"
          stack label="Profil" icon="person" />
          <q-btn to="/training" :class="{ active: $route.name === 'Training' }"
          stack label="Training" icon="fitness_center" />
          <q-btn to="/ernaehrung" :class="{ active: $route.name === 'Ernährung' }"
          stack label="Ernährung" icon="fastfood" />
        </q-btn-group>
      </nav>
    </q-footer>
  </q-layout>
  <Register v-else-if="signedIn === false"/>
  <div v-else class="loading"></div>

</template>

<script setup>
// TODO Remove as many Libarys as possible from here and capsule it in components
import auth from '@/api/authentication';
import Register from '@/components/Register.vue';
import {
  ref, onBeforeMount, onMounted,
} from 'vue';
import { useQuasar } from 'quasar';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import PubSub from 'pubsub-js';

dayjs.extend(customParseFormat);

// reactive state
const signedIn = ref(0);
const date = ref({ from: dayjs().day(1).format('DD.MM.YYYY'), to: dayjs().day(7).format('DD.MM.YYYY') });
const $q = useQuasar();
window.aiofGlobalDateFrom = dayjs().day(1).format('YYYYMMDD');
window.aiofGlobalDateTo = dayjs().day(7).format('YYYYMMDD');

function callBack(data) {
  if (data) {
    signedIn.value = true;
  } else {
    signedIn.value = false;
  }
  $q.loading.hide();
}

function updateDate() {
  window.aiofGlobalDateFrom = dayjs(date.value.from, 'DD.MM.YYYY', true).format('YYYYMMDD');
  window.aiofGlobalDateTo = dayjs(date.value.to, 'DD.MM.YYYY', true).format('YYYYMMDD');
  PubSub.publish('date.changed');
}

// lifecycle hooks
onBeforeMount(() => {
  $q.loading.show();
});

onMounted(() => {
  auth.startAuthObserver(callBack);
});
</script>

<style lang="less">
html {
  body {
    font-size: 16px;

    .q {
      &-input, &-btn {
        font-size: 16px;
      }
    }
  }
}

footer {
  .nav {
    .q-btn-group {
      min-height: 63px;
    }

    a {
      opacity: 0.7;
      transition: all 0.2s ease-in-out;
      padding: 0;

      &.active {
        opacity: 1;
        font-size: 16px;
      }
    }
  }
}
</style>
