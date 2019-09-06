import React from 'react'
import ReactDOM from 'react-dom'
import WordPage from '@/components/WordPage'
import { injectSaladictInternal } from '@/_helpers/injectSaladictInternal'

window.__SALADICT_INTERNAL_PAGE__ = true

// inject panel first(but after global flags) to listen to page event
injectSaladictInternal()

ReactDOM.render(<WordPage area="history" />, document.getElementById('root'))
