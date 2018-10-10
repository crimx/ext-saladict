import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'

import './quick-search.scss'

window.__SALADICT_INTERNAL_PAGE__ = true
window.__SALADICT_QUICK_SEARCH_PAGE__ = true
injectSaladictInternal(true) // inject panel AFTER flags are set
