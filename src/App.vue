<template>
  <q-layout view="hHh lpR fFf" v-if="signedIn === true">
    <q-header reveal elevated class="bg-primary text-white q-pa-sm">
      <q-toolbar>
        <q-toolbar-title>
          {{$route.name}}
        </q-toolbar-title>
        <nav class="nav">
        </nav>
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
import auth from '@/api/authentication';
import Register from '@/components/Register.vue';
import {
  ref, onBeforeMount, onMounted,
} from 'vue';
import { useQuasar } from 'quasar';

// reactive state
const signedIn = ref(0);
const $q = useQuasar();

function callBack(data) {
  if (data) {
    signedIn.value = true;
  } else {
    signedIn.value = false;
  }
  $q.loading.hide();
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
