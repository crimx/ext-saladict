import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import WordPage from '@/components/WordPage'

document.title = 'Saladict History'

ReactDOM.render(<WordPage area="history" />, document.getElementById('root'))
