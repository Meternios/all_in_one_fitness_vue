// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBnvRQFRJq2r_ddhU2HUcz1QwVRB3GOs7o',
  authDomain: 'all-in-one-fitness-b99d0.firebaseapp.com',
  databaseURL: 'https://all-in-one-fitness-b99d0-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'all-in-one-fitness-b99d0',
  storageBucket: 'all-in-one-fitness-b99d0.appspot.com',
  messagingSenderId: '397087168802',
  appId: '1:397087168802:web:ba8de390ea49b8ec78ed7b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
