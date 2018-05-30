import Vue from 'vue'
import App from './Popup.vue'
import VueQriously from 'vue-qriously'
import VueI18Next from '@panter/vue-i18next'
import i18nLoader from '@/_helpers/i18n'
import popupLocles from '@/_locales/popup'

// keep search history
// window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_POPUP_PAGE__ = true
injectPanel() // inject panel AFTER flags are set

Vue.use(VueQriously)
Vue.use(VueI18Next)
Vue.config.productionTip = false

// Vue.use(VueI18Next) before loading
const i18n = new VueI18Next(i18nLoader({ popup: popupLocles }, 'popup'))

// tslint:disable-next-line: no-unused-expression
new Vue({ // eslint-disable-line no-new
  el: '#root',
  i18n,
  render: h => h(App),
})

function injectPanel () {
  const $script = document.createElement('script')
  $script.src = './content.js'
  $script.type = 'text/javascript'

  document.body.appendChild($script)
}
