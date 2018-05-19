import React from 'react'
import ReactDOM from 'react-dom'
import WordPage from '@/components/WordPage'

window.__SALADICT_INTERNAL_PAGE__ = true

// inject panel first(but after global flags) to listen to page event
const $scriptSelection = document.createElement('script')
$scriptSelection.src = './selection.js'
$scriptSelection.type = 'text/javascript'

const $scriptContent = document.createElement('script')
$scriptContent.src = './content.js'
$scriptContent.type = 'text/javascript'

document.body.appendChild($scriptSelection)
document.body.appendChild($scriptContent)

ReactDOM.render(<WordPage area='notebook' />, document.getElementById('root'))
