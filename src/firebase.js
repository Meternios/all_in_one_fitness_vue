// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getMessaging } from 'firebase/messaging';
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
const auth = getAuth();
const messaging = getMessaging(app);

if (process.env.NODE_ENV === 'development') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcwE6YeAAAAAFTlJ-OvIS5MR4MGzxMZvn3wTxIC'),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});

export default {
  database,
  auth,
  appCheck,
  messaging,
};
