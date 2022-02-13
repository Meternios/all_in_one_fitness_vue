import 'quasar/dist/quasar.css';
import lang from 'quasar/lang/de';
import '@quasar/extras/material-icons/material-icons.css';
import { Loading, Notify } from 'quasar';

// To be used on app.use(Quasar, { ... })
export default {
  config: {
    brand: {
      primary: '#01579b',
      secondary: '#4f83cc',
      accent: '#ffab40',

      dark: '#002f6c',

      positive: '#2e7d32',
      negative: '#c62828',
      info: '#0277bd',
      warning: '#f57f17',
    },
  },
  plugins: {
    Loading,
    Notify,
  },
  lang,
};
