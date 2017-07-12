import Vue from 'vue'
import App from './Shareimg'

import VueHighcharts from 'vue-highcharts'
Vue.use(VueHighcharts)

Vue.config.productionTip = false

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: h => h(App)
})
