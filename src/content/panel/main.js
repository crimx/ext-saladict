import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

let vm = new Vue({ // eslint-disable-line no-new
  // el: '#app',
  render: h => h(App)
})

document.body.appendChild(vm.$mount().$el)
