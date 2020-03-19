import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import WordPage from '@/components/WordPage'

document.title = 'Saladict Notebook'

ReactDOM.render(<WordPage area="notebook" />, document.getElementById('root'))
