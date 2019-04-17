import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'
import { message } from '@/_helpers/browser-api'
import { MsgType } from '@/typings/message'

import './quick-search.scss'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_QUICK_SEARCH_PAGE__ = true
injectSaladictInternal(true) // inject panel AFTER flags are set

window.addEventListener('unload', () => {
  message.send({ type: MsgType.CloseQSPanel })
})
