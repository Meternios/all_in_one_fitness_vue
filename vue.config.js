module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false,
    },
  },
  transpileDependencies: [
    'quasar',
  ],
  css: {
    loaderOptions: {
      // pass Less.js Options to less-loader
      less: {
        // http://lesscss.org/usage/#less-options-strict-units `Global Variables`
        // `primary` is global variables fields name
        globalVars: {
          primary: '#01579b',
          secondary: '#4f83cc',
          accent: '#ffab40',

          dark: '#002f6c',

          positive: '#2e7d32',
          negative: '#c62828',
          info: '#0277bd',
          warning: '#f57f17',

          white: '#fff',
          black: '#000',
          gray: '#e0e0e0',

          screen_sm_up: 'screen and (min-width: 600px)',
          screen_md_up: 'screen and (min-width: 1024px)',
          screen_lg_up: 'screen and (min-width: 1440px)',
        },
      },
    },
  },
};
