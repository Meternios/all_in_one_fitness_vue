import { getToken } from 'firebase/messaging';
import firebase from '../firebase';

class Messaging {
    getTokenMessaging = () => getToken(firebase.messaging,
      {
        vapidKey: 'BO0HYOZrccbHY-p5jl633Yhpng_FLm8z59ge2cKEnmFyEv33h-P-U7xnsK6hqXPG8yNWvciBv-ZhdvQg0mk-7ks',
      });
}

export default new Messaging();
