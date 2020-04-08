import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { WordPage } from '@/components/WordPage'
import { AntdRoot } from '@/components/AntdRoot'

document.title = 'Saladict Notebook'

ReactDOM.render(
  <AntdRoot path="/wordpage/notebook">
    <WordPage area="notebook" />
  </AntdRoot>,
  document.getElementById('root')
)
