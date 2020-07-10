import './env'
import '@/selection'

import React from 'react'

import { initAntdRoot } from '@/components/AntdRoot'
import { MainEntry } from './components/MainEntry'

import './_style.scss'

document.title = 'Saladict Options'

initAntdRoot(() => <MainEntry />)
