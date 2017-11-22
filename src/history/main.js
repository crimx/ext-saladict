import Vue from 'vue'
import App from './History'
import {storage, message} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'

Vue.config.productionTip = false

document.title = chrome.i18n.getMessage('history_title')

Promise.all([message.send({msg: 'PAGE_ID'}), storage.sync.get('config')])
  .then(([pageId, {config}]) => {
    new Vue({ // eslint-disable-line no-new
      el: '#app',
      render (createElement) {
        return createElement(App, {
          props: {
            pageId: this.pageId,
            config: this.config,
            i18n: key => chrome.i18n.getMessage(key)
          }
        })
      },
      data () {
        return {
          pageId: pageId || -1,
          config: config || new AppConfig()
        }
      },
      created () {
        storage.sync.listen('config', changes => {
          let config = changes.config.newValue
          if (config) {
            this.config = config
          }
        })
      }
    })

    message.on('PANEL_READY', (data, sender, sendResponse) => {
      if (pageId !== -1 && pageId !== data.page) { return }
      // trigger the paste command
      sendResponse({noSearchHistory: true})
    })
  })
