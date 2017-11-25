import Vue from 'vue'
import App from 'src/components/WordPage'
import {storage, message} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'
import RecordManager from 'src/helpers/storage-records'

Vue.config.productionTip = false
Vue.config.devtools = false

document.title = chrome.i18n.getMessage('notebook_title')

storage.sync.get('config')
  .then(({config = new AppConfig()}) => {
    const vm = new Vue({
      el: '#app',
      data: {config},
      render (createElement) {
        return createElement(App, {
          props: {
            id: 'notebook',
            config: this.config,
            downloadFileName: 'new-words.txt',
            i18n: key => chrome.i18n.getMessage(key),
            recordManager: new RecordManager('notebook')
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

    message.self.on('PANEL_READY', (data, sender, sendResponse) => {
      // trigger the paste command
      sendResponse({noSearchHistory: true})
    })
  })
