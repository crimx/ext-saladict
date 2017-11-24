import Vue from 'vue'
import App from './Popup'
import VueQriously from 'vue-qriously'
import VueStash from 'vue-stash'
import {storage} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'

Vue.use(VueQriously)
Vue.use(VueStash)
Vue.config.productionTip = false
Vue.config.devtools = false

storage.sync.get('config')
  .then(({config}) => {
    const store = {
      config: config || new AppConfig(),
      i18n: key => chrome.i18n.getMessage(key)
    }

    new Vue({ // eslint-disable-line no-new
      el: '#app',
      render: h => h(App),
      data: {store},
      created () {
        storage.sync.listen('config', changes => {
          let config = changes.config.newValue
          if (config) {
            this.store.config = config
          }
        })
      }
    })
  })
