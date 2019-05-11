/*-----------------------------------------------*\
    Dicts
\*-----------------------------------------------*/

import setupEnv from './devDict'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'

const dict = 'cnki'
const dictConfig = (getDefaultProfile() as ProfileMutable).dicts.all[dict]

setupEnv({
  dict,
  dictConfig,
  text: 'love', // 当たる 吐く
})

/*-----------------------------------------------*\
    Wordpage
\*-----------------------------------------------*/

// import React from 'react'
// import ReactDOM from 'react-dom'
// import WordPage from '../WordPage'

// ReactDOM.render(<WordPage area='history' />, document.getElementById('root'))
