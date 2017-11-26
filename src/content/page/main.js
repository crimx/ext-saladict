import Vue from 'vue'
import App from './Container'
import {storage, message} from 'src/helpers/chrome-api'

Vue.config.productionTip = false
Vue.config.devtools = false

var vm

storage.sync.get('config').then(({config}) => {
  if (config && config.active) {
    activate(config)
  }

  storage.sync.listen('config', changes => {
    const newConfig = changes.config.newValue
    if (vm) {
      vm.config = newConfig
    } else {
      if (newConfig.active) {
        activate(newConfig)
      }
    }
  })
})

function activate (config) {
  vm = new Vue({
    data: {config},
    render (createElement) {
      return createElement(App, {
        props: {
          config: this.config
        }
      })
    }
  }).$mount()

  document.body.appendChild(vm.$el)

  message.self.on('SELECTION', (data, sender, sendResponse) => {
    // eavesdropping, check if dom element being removed
    if (!document.querySelector('.saladict-container')) {
      document.body.appendChild(vm.$el)
    }
  })
}
