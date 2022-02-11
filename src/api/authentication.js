import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import firebase from '../firebase';

class Authentication {
  constructor() {
    this.provider = new GoogleAuthProvider();
    this.getCurrentUser();
  }

  create = (email, password) => createUserWithEmailAndPassword(firebase.auth, email, password);

  signIn = (email, password) => signInWithEmailAndPassword(firebase.auth, email, password);

  signOut = () => signOut(firebase.auth);

  googleSignIn = () => signInWithPopup(firebase.auth, this.provider);

  getCurrentUser = () => {
    onAuthStateChanged(firebase.auth, (user) => {
      if (user) {
        console.log('logged in');
      } else {
        console.log('usser logged out');
      }
    });
  }
}

export default new Authentication();
