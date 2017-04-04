import Vue from 'vue'
import App from './Container'
import defaultConfig from 'src/app-config'
import {storage} from 'src/helpers/chrome-api'

Vue.config.productionTip = false

var vm

storage.listen('config', changes => {
  if (changes.config.newValue.active && !vm) {
    activate()
  }
})

storage.sync.get('config').then(result => {
  if (result.config && result.config.active) {
    activate()
  } else {
    handleNoConfig()
  }
}, handleNoConfig)

function handleNoConfig () {
  storage.sync.set({config: defaultConfig})
}

function activate () {
  vm = new Vue({
    render: h => h(App)
  })
  .$mount()

  document.body.insertBefore(vm.$el, document.body.childNodes[0])
}
