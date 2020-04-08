import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { WordPage } from '@/components/WordPage'
import { AntdRoot } from '@/components/AntdRoot'

document.title = 'Saladict History'

ReactDOM.render(
  <AntdRoot path="/wordpage/history">
    <WordPage area="history" />
  </AntdRoot>,
  document.getElementById('root')
)
