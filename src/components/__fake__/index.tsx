/*-----------------------------------------------*\
    Dicts
\*-----------------------------------------------*/

import setupEnv from './devDict'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'

const dict = 'cobuild'
const dictConfig = (getDefaultProfile() as ProfileMutable).dicts.all[dict]
dictConfig.options.cibaFirst = false

setupEnv({
  dict,
  dictConfig,
  text: 'how', // 当たる 吐く
})

/*-----------------------------------------------*\
    Wordpage
\*-----------------------------------------------*/

// import React from 'react'
// import ReactDOM from 'react-dom'
// import WordPage from '../WordPage'

// ReactDOM.render(<WordPage area='history' />, document.getElementById('root'))
