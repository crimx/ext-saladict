import Vue from 'vue'
import App from './Options'
import VueStash from 'vue-stash'
import {storage} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'

Vue.use(VueStash)
Vue.config.productionTip = false
Vue.config.devtools = false

document.title = chrome.i18n.getMessage('opt_title')

storage.sync.get('config')
  .then(({config}) => {
    const store = {
      config: config || new AppConfig(),
      unlock: false,
      newVersionAvailable: false,
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

        // check new version
        fetch('https://api.github.com/repos/crimx/crx-saladict/releases/latest')
          .then(r => r.json())
          .then(data => {
            if (data && data.tag_name) {
              let vGithub = /\d+\.\d+\.\d+/.exec(data.tag_name)
              if (!vGithub) { return }
              let gits = vGithub[0].split('.').map(v => Number(v))
              let curs = chrome.runtime.getManifest().version.split('.').map(v => Number(v))
              this.store.newVersionAvailable = gits[0] !== curs[0]
                ? gits[0] > curs[0]
                : gits[1] !== curs[1] ? gits[1] > curs[1] : gits[2] > curs[2]
            }
          })
      }
    })
  })
