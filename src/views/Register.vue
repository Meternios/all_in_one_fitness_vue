<template>
  <h1>Create an Account</h1>
  <p><input type="text" placeholder="Email" v-model="email" /></p>
  <p><input type="password" placeholder="Password" v-model="password" /></p>
  <p><button @click="register">Register</button></p>
  <p><button @click="signIn">Sign in</button></p>
  <p><button @click="signOut">Sign out</button></p>
  <p><button @click="googleSignIn">Google Sign in</button></p>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import auth from '../api/authentication';

// import router
const email = ref('');
const password = ref('');
const router = useRouter(); // get a reference to our vue router

const register = () => {
  auth.create(email.value, password.value)
    .then((data) => {
      console.log(`Successfully registered!${data}`);
      router.push('/'); // redirect to the feed
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
    });
};

const signIn = () => {
  auth.signIn(email.value, password.value)
    .then((data) => {
      console.log(`Successfully logged in!${data}`);
      router.push('/'); // redirect to the feed
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
    });
};

const signOut = () => {
  auth.signOut()
    .then((data) => {
      console.log(`Successfully logged out!${data}`);
      router.push('/'); // redirect to the feed
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
    });
};

const googleSignIn = () => {
  auth.googleSignIn()
    .then((data) => {
      console.log(`Successfully logged in with google!${data}`);
      router.push('/'); // redirect to the feed
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
    });
};
</script>
