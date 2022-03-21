import { getToken } from 'firebase/messaging';
import { onBackgroundMessage } from 'firebase/messaging/sw';
import firebase from '@/firebase';

getToken(firebase.messaging,
  {
    vapidKey: 'BO0HYOZrccbHY-p5jl633Yhpng_FLm8z59ge2cKEnmFyEv33h-P-U7xnsK6hqXPG8yNWvciBv-ZhdvQg0mk-7ks',
  });

onBackgroundMessage(firebase.messaging, (payload) => {
  const promiseChain = window.clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i += 1) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload);
      }
    })
    .then(() => window.registration.showNotification('my notification title'));
  return promiseChain;
});
