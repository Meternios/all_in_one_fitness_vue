<template>
  <q-layout view="hHh lpR fFf" v-if="signedIn === true">
    <q-header reveal elevated class="bg-primary text-white q-pa-sm">
      <q-toolbar>
        <q-toolbar-title>
          All in one Fitness
        </q-toolbar-title>
        <nav class="nav">
          <router-link to="/">Home</router-link> |
          <router-link to="/about">About</router-link> |
          <a @click="signOut" href="#">Sign out</a>
        </nav>
      </q-toolbar>
    </q-header>

    <main class="q-main">
      <q-page-container>
        <router-view />
      </q-page-container>
    </main>

    <q-footer elevated class="bg-primary q-pa-lg">
      <nav class="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link>
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
import firebase from './firebase';

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

function signOut() {
  firebase.auth.signOut()
    .catch((error) => {
      console.log(error.message);
    });
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
.nav {
  a {
    font-weight: bold;
    color: @white;

    &.router-link-exact-active {
      color: @accent;
    }
  }
}
</style>
