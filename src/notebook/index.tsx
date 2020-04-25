import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { WordPage } from '@/components/WordPage'
import { AntdRoot, switchAntdTheme } from '@/components/AntdRoot'
import { createConfigStream } from '@/_helpers/config-manager'

document.title = 'Saladict Notebook'

let rendered = false

createConfigStream().subscribe(async config => {
  await switchAntdTheme(config.darkMode)

  if (!rendered) {
    ReactDOM.render(
      <AntdRoot path="/wordpage/notebook">
        <WordPage area="notebook" />
      </AntdRoot>,
      document.getElementById('root')
    )

    rendered = true
  }
})
