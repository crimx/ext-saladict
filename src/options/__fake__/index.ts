import React from 'react'
import ReactDOM from 'react-dom'
import { initConfig } from '@/_helpers/config-manager'
import { initProfiles } from '@/_helpers/profile-manager'
import { Options } from '../index'

Promise.all([initConfig(), initProfiles()]).then(() => {
  ReactDOM.render(
    React.createElement(Options),
    document.getElementById('root'),
  )
})
