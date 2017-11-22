import Vue from 'vue'
import App from './Popup'
import VueStash from 'vue-stash'
import {storage, message} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'

Vue.use(VueStash)
Vue.config.productionTip = false

Promise.all([message.send({msg: 'PAGE_ID'}), storage.sync.get('config')])
  .then(([pageId, {config}]) => {
    const store = {
      pageId: pageId || -1,
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
