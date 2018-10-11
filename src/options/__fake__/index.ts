import Vue from 'vue'
import VueI18Next from '@panter/vue-i18next'
import VueStash from 'vue-stash'
import App from '../Options.vue'

import { defaultProfilesFactory } from '@/app-config/default-profiles'

import i18nLoader from '@/_helpers/i18n'
import commonLocles from '@/_locales/common'
import dictsLocles from '@/_locales/dicts'
import optionsLocles from '@/_locales/options'
import contextLocles from '@/_locales/context'
import profileLocles from '@/_locales/config-profiles'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_OPTIONS_PAGE__ = true
window.__SALADICT_LAST_SEARCH__ = ''

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

const profiles = defaultProfilesFactory()

// tslint:disable
new Vue({
  el: '#app',
  i18n,
  render: h => h(App),
  data: {
    store: {
      config: profiles[0],
      activeConfigID: profiles[0].id,
      configProfileIDs: profiles.map(config => config.id),
      configProfiles: profiles.reduce((o, p) => (o[p.id] = p, o), {}),
      unlock: false,
      newVersionAvailable: false,
      searchText (text?: string) {
        clearTimeout(this['__searchTextTimeout'])
        if (window.innerWidth > 1024) {
          this['__searchTextTimeout'] = setTimeout(() => {
            console.log('search text: ' + text || window.__SALADICT_LAST_SEARCH__ || 'salad')
          }, window.__SALADICT_LAST_SEARCH__ ? 2000 : 0)
        }
      }
    }
  },
})
