import Vue from 'vue'
import App from './Container'
import {storage, message} from 'src/helpers/chrome-api'
import youdaoPage from './fanyi.youdao.2.0'

Vue.config.productionTip = false

var pageId = -1
message.send({msg: 'PAGE_ID'}, id => {
  if (id) {
    pageId = id
  }
})

/**
 * Inject any script to page
 */
message.on('LOAD-YOUDAO-PAGE', (data, sender, sendResponse) => {
  youdaoPage.load()
  sendResponse()
})

var vm

storage.listen('config', changes => {
  if (changes.config.newValue.active && !vm) {
    activate()
  }
})

storage.sync.get('config').then(result => {
  if (result.config && result.config.active) {
    activate()
  }
})

message.on('SELECTION', (data, sender, sendResponse) => {
  if (pageId !== -1 && pageId !== data.page) { return }

  // check if dom element being removed
  if (vm && vm.$el && !document.querySelector('.saladict-container')) {
    document.body.appendChild(vm.$el)
    sendResponse()
  }
})

function activate () {
  vm = new Vue({
    render: h => h(App)
  })
  .$mount()

  document.body.appendChild(vm.$el)
}
