import './env'
import '@/selection'

import React from 'react'
import { WordPage } from '@/components/WordPage'
import { initAntdRoot } from '@/components/AntdRoot'

document.title = 'Saladict Notebook'

initAntdRoot(() => <WordPage area="notebook" />, '/wordpage/notebook')
