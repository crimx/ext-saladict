import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { WordPage } from '@/components/WordPage'
import { AntdRoot } from '@/_helpers/antd'

ReactDOM.render(
  <AntdRoot
    path="/wordpage/notebook"
    titleKey="title.notebook"
    titleNS="wordpage"
  >
    <WordPage area="notebook" />
  </AntdRoot>,
  document.getElementById('root')
)
