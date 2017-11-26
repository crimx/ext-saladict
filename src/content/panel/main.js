import Vue from 'vue'
import App from './Panel'
import AppConfig from 'src/app-config'
import {storage} from 'src/helpers/chrome-api'

Vue.config.productionTip = false
Vue.config.devtools = false

storage.sync.get('config')
  .then(({config = new AppConfig()}) => {
    // Dynamically & asynchronously loads components
    Object.keys(config.dicts.all).forEach(id => {
      Vue.component(id, () => Promise.resolve(require('src/dictionaries/' + id + '/view.vue')))
    })

    const vm = new Vue({
      el: '#app',
      data: {config},
      render (createElement) {
        return createElement(App, {
          props: {
            config: this.config,
            i18n: key => chrome.i18n.getMessage(key)
          }
        })
      }
    })

    storage.sync.listen('config', changes => {
      let config = changes.config.newValue
      if (config) {
        vm.config = config
      }
    })
  })
