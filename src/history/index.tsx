import './env'
import '@/selection'

import ReactDOM from 'react-dom'
import { getLocaledWordPage } from '@/components/WordPage'

document.title = 'Saladict History'

getLocaledWordPage('history').then(wordPage => {
  ReactDOM.render(wordPage, document.getElementById('root'))
})
