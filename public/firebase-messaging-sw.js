importScripts('/__/firebase/9.6.10/firebase-app-compat.js');
importScripts('/__/firebase/9.6.10/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBnvRQFRJq2r_ddhU2HUcz1QwVRB3GOs7o',
  authDomain: 'all-in-one-fitness-b99d0.firebaseapp.com',
  databaseURL: 'https://all-in-one-fitness-b99d0-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'all-in-one-fitness-b99d0',
  storageBucket: 'all-in-one-fitness-b99d0.appspot.com',
  messagingSenderId: '397087168802',
  appId: '1:397087168802:web:ba8de390ea49b8ec78ed7b',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
