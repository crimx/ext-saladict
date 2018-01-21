import Vue from 'vue'
import App from './Options'
import i18n from 'vue-plugin-webextension-i18n'
import VueStash from 'vue-stash'
import {storage} from 'src/_helpers/browser-api'
import checkUpdate from 'src/_helpers/check-update'
import AppConfig from 'src/app-config'

Vue.use(VueStash)
Vue.use(i18n)
Vue.config.productionTip = false
Vue.config.devtools = false

document.title = browser.i18n.getMessage('opt_title')

storage.sync.get('config')
  .then(({config}) => {
    const store = {
      config: config || new AppConfig(),
      unlock: false,
      newVersionAvailable: false
    }

    new Vue({ // eslint-disable-line no-new
      el: '#app',
      render: h => h(App),
      data: {store},
      created () {
        storage.sync.listen('config', changes => {
          let config = changes.config.newValue
          if (config) {
            // only listen to active setting in popup panel
            this.store.config.active = config.active
          }
        })

        storage.sync.get('unlock', ({unlock}) => {
          this.store.unlock = Boolean(unlock)
          storage.sync.listen('unlock', changes => {
            this.store.unlock = changes.unlock.newValue
          })
        })

        checkUpdate().then(({isAvailable}) => {
          this.store.newVersionAvailable = isAvailable
        })
      }
    })
  })
