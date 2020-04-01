import './env'
import '@/selection'

import ReactDOM from 'react-dom'
import { getLocaledWordPage } from '@/components/WordPage'

document.title = 'Saladict Notebook'

getLocaledWordPage('notebook').then(wordPage => {
  ReactDOM.render(wordPage, document.getElementById('root'))
})
