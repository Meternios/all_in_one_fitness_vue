import { getToken, onMessage } from 'firebase/messaging';
import firebase from '@/firebase';

class CloudMessaging {
    getToken = () => getToken(firebase.messaging,
      {
        vapidKey: 'BO0HYOZrccbHY-p5jl633Yhpng_FLm8z59ge2cKEnmFyEv33h-P-U7xnsK6hqXPG8yNWvciBv-ZhdvQg0mk-7ks',
      });

    startMessageObserver = ($q) => onMessage(firebase.messaging, (payload) => {
      $q.notify({
        message: payload.notification.title,
        caption: payload.notification.body,
        position: 'top-right',
        type: 'info',
        progress: true,
      });
    });
}

export default new CloudMessaging();
