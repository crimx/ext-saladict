import Vue from 'vue'
import VueI18Next from '@panter/vue-i18next'
import VueStash from 'vue-stash'
import App from './Options'
import { storage } from '../_helpers/browser-api'
import checkUpdate from '../_helpers/check-update'
import { appConfigFactory } from '../app-config'

import i18next from 'i18next'
import i18nLoader from '@/_helpers/i18n'
import commonLocles from '@/_locales/common'
import dictsLocles from '@/_locales/dicts'
import optionsLocles from '@/_locales/options'
import contextLocles from '@/_locales/context'

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

console.log('sddddddffffff')

storage.sync.get('config')
  .then(({ config }) => {
    console.log('x')
    const store = {
      config: config || appConfigFactory(),
      unlock: false,
      newVersionAvailable: false
    }

    new Vue({
      el: '#app',
      i18n,
      render: h => h(App),
      data: { store },
      created () {
        storage.sync.addListener('config', changes => {
          let config = changes.config.newValue
          if (config) {
            // only listen to active setting in popup panel
            this.store.config.active = config.active
          }
        })

        storage.sync.get('unlock', ({ unlock }) => {
          this.store.unlock = Boolean(unlock)
          storage.sync.addListener('unlock', changes => {
            this.store.unlock = changes.unlock.newValue
          })
        })

        checkUpdate().then(({ isAvailable }) => {
          this.store.newVersionAvailable = isAvailable
        })
      }
    })
  })
