import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { combineLatest } from 'rxjs'
import { filter } from 'rxjs/operators'

import { AntdRoot, switchAntdTheme } from '@/components/AntdRoot'
import { config$$, profile$$, profileIDList$$, GlobalsContext } from './data'
import { MainEntry } from './components/MainEntry'

import './_style.scss'

document.title = 'Saladict Options'

let rendered = false
const globals = {} as GlobalsContext

// Wait all settings loaded so that
// we don't have to worry about Form initial state.
combineLatest(config$$, profile$$, profileIDList$$)
  .pipe(filter(arr => arr.every(Boolean)))
  .subscribe(async ([config, profile, profileIDList]) => {
    globals.config = config
    globals.profile = profile
    globals.profileIDList = profileIDList

    await switchAntdTheme(config.darkMode)

    if (!rendered) {
      globals.dirty = false

      ReactDOM.render(
        <AntdRoot>
          <GlobalsContext.Provider value={globals}>
            <MainEntry />
          </GlobalsContext.Provider>
        </AntdRoot>,
        document.getElementById('root')
      )

      rendered = true
    }
  })
