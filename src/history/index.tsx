import React from 'react'
import ReactDOM from 'react-dom'
import WordPage from '@/components/WordPage'

window['__SALADICT_INTERNAL_PAGE__'] = true

ReactDOM.render(<WordPage area='history' />, document.getElementById('root'))

const $scriptSelection = document.createElement('script')
$scriptSelection.src = './selection.js'
$scriptSelection.type = 'text/javascript'

const $scriptContent = document.createElement('script')
$scriptContent.src = './content.js'
$scriptContent.type = 'text/javascript'

document.body.appendChild($scriptSelection)
document.body.appendChild($scriptContent)
