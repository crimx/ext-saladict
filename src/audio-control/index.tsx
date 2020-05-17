import React from 'react'
import ReactDOM from 'react-dom'
import Waveform from '@/components/Waveform/Waveform'

import './audio-control.scss'

const searchParams = new URL(document.URL).searchParams

const darkMode = Boolean(searchParams.get('darkmode'))

ReactDOM.render(
  <Waveform darkMode={darkMode} />,
  document.getElementById('root')
)
