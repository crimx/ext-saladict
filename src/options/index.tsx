import './env'
import '@/selection'

import React from 'react'
import ReactDOM from 'react-dom'
import { combineLatest } from 'rxjs'
import { take, filter } from 'rxjs/operators'

import { AntdRoot } from '@/components/AntdRoot'
import { config$$, profile$$, profileIDList$$, FormDirtyContext } from './data'
import { MainEntry } from './components/MainEntry'

import './_style.scss'

document.title = 'Saladict Options'

// Wait all settings loaded so that
// we don't have to worry about Form initial state.
combineLatest(config$$, profile$$, profileIDList$$)
  .pipe(
    filter(arr => arr.every(Boolean)),
    take(1)
  )
  .subscribe(() => {
    const dirtyRef = { current: false }

    ReactDOM.render(
      <AntdRoot>
        <FormDirtyContext.Provider value={dirtyRef}>
          <MainEntry />
        </FormDirtyContext.Provider>
      </AntdRoot>,
      document.getElementById('root')
    )
  })
