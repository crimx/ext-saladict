import React from 'react'
import ReactDOM from 'react-dom'
import Waveform from '@/components/Waveform/Waveform'

import './audio-control.scss'

const searchParams = new URL(document.URL).searchParams

const darkMode = Boolean(searchParams.get('darkmode'))

const rootStyles: React.CSSProperties = darkMode
  ? {
      backgroundColor: '#222',
      color: '#ddd',
      '--color-brand': '#218c74',
      '--color-background': '#222',
      '--color-rgb-background': '34, 34, 34',
      '--color-font': '#ddd',
      '--color-divider': '#4d4748'
    }
  : {
      backgroundColor: '#fff',
      color: '#333',
      '--color-brand': '#5caf9e',
      '--color-background': '#fff',
      '--color-rgb-background': '255, 255, 255',
      '--color-font': '#333',
      '--color-divider': '#ddd'
    }

ReactDOM.render(
  <Waveform darkMode={darkMode} rootStyles={rootStyles} />,
  document.getElementById('root')
)
