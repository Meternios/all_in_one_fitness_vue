import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import firebase from '../firebase';

class Authentication {
  provider = new GoogleAuthProvider();

  create = (email, password) => createUserWithEmailAndPassword(firebase.auth, email, password);

  signIn = (email, password) => signInWithEmailAndPassword(firebase.auth, email, password);

  signOut = () => signOut(firebase.auth);

  resetPassword = (email) => sendPasswordResetEmail(firebase.auth, email);

  googleSignIn = () => signInWithPopup(firebase.auth, this.provider);

  getCurrentUser = () => firebase.auth.currentUser;

  startAuthObserver = (callback) => {
    onAuthStateChanged(firebase.auth, (user) => {
      callback(user);
    });
  };
}

export default new Authentication();
