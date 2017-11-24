import Vue from 'vue'
import App from './Container'
import {storage, message} from 'src/helpers/chrome-api'

Vue.config.productionTip = false
Vue.config.devtools = false

var vm

storage.sync.listen('config', changes => {
  if (changes.config.newValue.active && !vm) {
    activate()
  }
})

storage.sync.get('config').then(result => {
  if (result.config && result.config.active) {
    activate()
  }
})

message.self.on('SELECTION', (data, sender, sendResponse) => {
  // check if dom element being removed
  if (vm && vm.$el && !document.querySelector('.saladict-container')) {
    document.body.appendChild(vm.$el)
  }
})

function activate () {
  vm = new Vue({
    render: h => h(App)
  }).$mount()

  document.body.appendChild(vm.$el)
}
