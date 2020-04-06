import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { AntdRoot } from '@/_helpers/antd'
import { MainEntry } from './components/MainEntry'

import './_style.scss'

document.title = 'Saladict Options'

ReactDOM.render(
  <AntdRoot>
    <MainEntry />
  </AntdRoot>,
  document.getElementById('root')
)
