import React from 'react'
import ReactDOM from 'react-dom'
import { initConfig } from '@/_helpers/config-manager'
import { Options } from '../index'

initConfig().then(() => {
  ReactDOM.render(
    React.createElement(Options),
    document.getElementById('root'),
  )
})
