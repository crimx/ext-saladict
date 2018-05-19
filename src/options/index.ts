import Vue from 'vue'
import VueI18Next from '@panter/vue-i18next'
import VueStash from 'vue-stash'
import App from './Options.vue'
import { message, storage } from '@/_helpers/browser-api'
import checkUpdate from '@/_helpers/check-update'
import { getDefaultSelectionInfo } from '@/_helpers/selection'
import { appConfigFactory, AppConfigMutable } from '@/app-config'

import i18nLoader from '@/_helpers/i18n'
import commonLocles from '@/_locales/common'
import dictsLocles from '@/_locales/dicts'
import optionsLocles from '@/_locales/options'
import contextLocles from '@/_locales/context'
import { MsgType, MsgSelection } from '@/typings/message'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_OPTIONS_PAGE__ = true
window.__SALADICT_LAST_SEARCH__ = 'salad'

injectPanel()

Vue.use(VueStash)
Vue.use(VueI18Next)
Vue.config.productionTip = false

// Vue.use(VueI18Next) before loading
const i18n = new VueI18Next(i18nLoader({
  common: commonLocles,
  opt: optionsLocles,
  dict: dictsLocles,
  ctx: contextLocles,
}, 'common'))

storage.sync.get('config')
  .then(({ config }) => {
    // tslint:disable
    new Vue({
      el: '#app',
      i18n,
      render: h => h(App),
      data: {
        store: {
          config: (config || appConfigFactory()) as AppConfigMutable,
          unlock: false,
          newVersionAvailable: false,
          searchText () {
            clearTimeout(this['__searchTextTimeout'])
            if (window.innerWidth > 1024) {
              this['__searchTextTimeout'] = setTimeout(() => {
                message.self.send<MsgSelection>({
                  type: MsgType.Selection,
                  selectionInfo: getDefaultSelectionInfo({
                    text: window.__SALADICT_LAST_SEARCH__ || 'salad'
                  }),
                  mouseX: window.innerWidth - this.$store.config.panelWidth - 110,
                  mouseY: window.innerHeight * (1 - this.$store.config.panelMaxHeightRatio) / 2 + 50,
                  dbClick: false,
                  ctrlKey: false,
                })
              }, 2000)
            }
          }
        }
      },
      created () {
        storage.sync.get('unlock')
          .then(({ unlock }) => {
            this.store.unlock = Boolean(unlock)
            storage.sync.addListener('unlock', changes => {
              this.store.unlock = changes.unlock.newValue
            })
          })

        checkUpdate().then(({ isAvailable }) => {
          this.store.newVersionAvailable = isAvailable
        })
      },
    })
  })

function injectPanel () {
  const $script = document.createElement('script')
  $script.src = './content.js'
  $script.type = 'text/javascript'

  const $style = document.createElement('link')
  $style.href = './content.css'
  $style.rel = 'stylesheet'

  document.body.appendChild($script)
  document.body.appendChild($style)
}
