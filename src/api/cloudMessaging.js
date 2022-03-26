import { getToken, onMessage } from 'firebase/messaging';
import firebase from '@/firebase';
import { useQuasar } from 'quasar';

class CloudMessaging {
  constructor() {
    this.$q = useQuasar();
  }

    getToken = () => getToken(firebase.messaging,
      {
        vapidKey: 'BO0HYOZrccbHY-p5jl633Yhpng_FLm8z59ge2cKEnmFyEv33h-P-U7xnsK6hqXPG8yNWvciBv-ZhdvQg0mk-7ks',
      });

    startMessageObserver = () => onMessage(firebase.messaging, (payload) => {
      this.$q.notify({
        message: payload.notification.title,
        caption: payload.notification.body,
        position: 'top-right',
        type: 'info',
        progress: true,
      });
    });
}

export default new CloudMessaging();
