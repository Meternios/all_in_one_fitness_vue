<template>
<div class="sign-up">
  <div class="sign-up-window shadow-7">
    <div class="sign-up-head">
      <h1 class="text-h3">Anmelden</h1>
      <div class="text-subtitle">Bitte registriere -oder melde dich an um auf
            alle Funktionalitäten Zugriff zuhaben.</div>
    </div>
    <q-form class="sign-up-form q-mt-lg q-mb-sm" @submit="signIn">
      <q-input filled square outlined bg-color="gray" v-model="email" label="E-Mail" />
      <q-input filled square outlined bg-color="gray"
      v-bind:type="passwordType" ref="passwordInput" v-model="password" label="Password"
      >
        <template v-slot:append>
          <q-icon @click="togglePassword" v-bind:name="passwordIcon"/>
        </template>
      </q-input>
      <q-btn type="submit" :loading="loading[0]"
      unelevated color="primary" class="full-width">
        Anmelden
      </q-btn>
      <q-btn :loading="loading[1]" unelevated color="secondary"
      @click="register" class="full-width">
        Registrieren
      </q-btn>
      <q-btn :loading="loading[3]" flat class="full-width"
      @click="resetPassword">Passwort zurücksetzen</q-btn>
    </q-form>
    <div class="sign-up-footer">
      <q-btn :loading="loading[2]" unelevated outline
      @click="googleSignIn" class="full-width">
        <q-icon left name="img:img/googleIcon.svg"/>
        Mit Google anmelden
      </q-btn>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import auth from '@/api/authentication';
import { useQuasar } from 'quasar';

const email = ref('');
const password = ref('');
const passwordInput = ref('');
const passwordIcon = ref('visibility');
const passwordType = ref('password');
const loading = ref([
  false,
  false,
  false,
  false,
]);
const $q = useQuasar();

const handleMobileViewport = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

onMounted(() => {
  handleMobileViewport();
  // Todo: improve performance by debouncing
  window.addEventListener('resize', handleMobileViewport);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleMobileViewport);
});

const notifyError = (error) => {
  // Todo: add all error codes and make it globally available
  const params = {
    'invalid-email': 'Ungültige E-Mail Adresse',
    'internal-error': 'Ungültiges Passwort',
    'weak-password': 'Passwort muss mindestens 6 Zeichen beinhalten',
  };
  const code = error.code.split('/')[1];
  let errorMessage = `Ein Fehler ist passiert, bitte versuche es erneut. ${error.message}`;

  if (params[code]) {
    errorMessage = params[code];
  }

  $q.notify({
    message: errorMessage,
    position: 'top-right',
    type: 'negative',
    progress: true,
  });
};

const register = () => {
  loading.value[1] = true;
  auth.create(email.value, password.value)
    .then(() => {
      loading.value[1] = false;
    })
    .catch((error) => {
      loading.value[1] = false;
      notifyError(error);
    });
};

const signIn = (e) => {
  e.preventDefault();
  loading.value[0] = true;
  auth.signIn(email.value, password.value)
    .then(() => {
      loading.value[0] = false;
    })
    .catch((error) => {
      loading.value[0] = false;
      notifyError(error);
    });
};

const resetPassword = () => {
  loading.value[3] = true;
  auth.resetPassword(email.value)
    .then(() => {
      loading.value[3] = false;
    })
    .catch((error) => {
      loading.value[3] = false;
      notifyError(error);
    });
};

const googleSignIn = () => {
  loading.value[2] = true;
  auth.googleSignIn()
    .then(() => {
      loading.value[2] = false;
    })
    .catch((error) => {
      loading.value[2] = false;
      notifyError(error);
    });
};

const togglePassword = () => {
  passwordInput.value.focus();
  if (passwordType.value === 'password') {
    passwordIcon.value = 'visibility_off';
    passwordType.value = 'text';
  } else {
    passwordIcon.value = 'visibility';
    passwordType.value = 'password';
  }
};
</script>

<style scoped lang="less">
  h1{
    margin: 0
  }

  .sign-up {
    background-color: @gray;
    min-height: 470px;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;

    button {
      border-radius: 0;
    }

    &-form {
      label + label{
        margin-top: 8px;
      }

      button {
        margin-top: 8px;
      }
    }

    &-footer {
      border-top: 1px solid @primary;
      padding-top: 24px;

      button + button {
        margin-top: 8px;
      }
    }

    &-window {
      padding: 24px;
      border: 5px solid @primary;
      background-color: @white;
      height: 100%;
      width: 100%;

      // Todo: implement Variabel for Media Queries
      @media screen and (min-width: 600px){
        height: auto;
        width: auto;
      }
    }
  }
</style>
