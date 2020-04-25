import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { WordPage } from '@/components/WordPage'
import { AntdRoot, switchAntdTheme } from '@/components/AntdRoot'
import { createConfigStream } from '@/_helpers/config-manager'

document.title = 'Saladict History'

const rendered = false

createConfigStream().subscribe(async config => {
  await switchAntdTheme(config.darkMode)

  if (!rendered) {
    ReactDOM.render(
      <AntdRoot path="/wordpage/history">
        <WordPage area="history" />
      </AntdRoot>,
      document.getElementById('root')
    )
  }
})
