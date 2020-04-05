import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { AntdRoot } from '@/_helpers/antd'
import { Contexts } from './components/Contexts'
import { MainEntry } from './components/MainEntry'

import './_style.scss'

document.title = 'Saladict Options'

ReactDOM.render(
  <AntdRoot>
    <Contexts>
      <MainEntry />
    </Contexts>
  </AntdRoot>,
  document.getElementById('root')
)
