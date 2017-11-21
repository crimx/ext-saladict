import Vue from 'vue'
import App from './Popup'

import VueQriously from 'vue-qriously'
Vue.use(VueQriously)

Vue.config.productionTip = false

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: h => h(App)
})
