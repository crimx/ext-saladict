import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { AntdRoot } from '@/components/AntdRoot'
import { MainEntry } from './components/MainEntry'

import './_style.scss'

document.title = 'Saladict Options'

ReactDOM.render(
  <AntdRoot>
    <MainEntry />
  </AntdRoot>,
  document.getElementById('root')
)
