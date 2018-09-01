import Vue from 'vue'
import VueI18Next from '@panter/vue-i18next'
import VueStash from 'vue-stash'
import App from './Options.vue'
import { message, storage } from '@/_helpers/browser-api'
import checkUpdate from '@/_helpers/check-update'
import { getDefaultSelectionInfo } from '@/_helpers/selection'
import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'

import i18nLoader from '@/_helpers/i18n'
import commonLocles from '@/_locales/common'
import dictsLocles from '@/_locales/dicts'
import optionsLocles from '@/_locales/options'
import contextLocles from '@/_locales/context'
import profileLocles from '@/_locales/config-profiles'
import { MsgType, MsgSelection } from '@/typings/message'
import { getActiveConfigID, getConfigIDList } from '@/_helpers/config-manager'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_OPTIONS_PAGE__ = true
window.__SALADICT_LAST_SEARCH__ = ''

if (process.env.NODE_ENV !== 'development') {
  injectSaladictInternal()
}

Vue.use(VueStash)
Vue.use(VueI18Next)
Vue.directive('focus', { inserted: el => el.focus() })
Vue.directive('select', { inserted: (el: any) => el.select() })
Vue.config.productionTip = false

// Vue.use(VueI18Next) before loading
const i18n = new VueI18Next(i18nLoader({
  common: commonLocles,
  opt: optionsLocles,
  dict: dictsLocles,
  ctx: contextLocles,
  profile: profileLocles,
}, 'common'))

Promise.all([getActiveConfigID(), getConfigIDList()])
  .then(async ([activeConfigID, configProfileIDs]) => {
    const configProfiles = await storage.sync.get(configProfileIDs)
    // tslint:disable
    new Vue({
      el: '#app',
      i18n,
      render: h => h(App),
      data: {
        store: {
          config: configProfiles[activeConfigID],
          activeConfigID,
          configProfileIDs,
          configProfiles,
          unlock: false,
          newVersionAvailable: false,
          searchText (text?: string) {
            clearTimeout(this['__searchTextTimeout'])
            if (window.innerWidth > 1024) {
              this['__searchTextTimeout'] = setTimeout(() => {
                message.self.send<MsgSelection>({
                  type: MsgType.Selection,
                  selectionInfo: getDefaultSelectionInfo({
                    text: text || window.__SALADICT_LAST_SEARCH__ || 'salad'
                  }),
                  self: true,
                  instant: true,
                  mouseX: window.innerWidth - this.$store.config.panelWidth - 110,
                  mouseY: window.innerHeight * (1 - this.$store.config.panelMaxHeightRatio) / 2 + 50,
                  dbClick: false,
                  ctrlKey: false,
                })
              }, window.__SALADICT_LAST_SEARCH__ ? 2000 : 0)
            }
          }
        }
      },
      created () {
        if (process.env.NODE_ENV !== 'development') {
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
        }
      },
    })
  })
