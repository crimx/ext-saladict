import React from 'react'
import { TranslationFunction } from 'i18next'

import './_style.scss'

export interface LangCodeListProps {
  t: TranslationFunction
  langs: string
}

const langCodes = ['en', 'zhs', 'zht', 'ja', 'kor', 'fr', 'de', 'es']

export default class LangCodeList extends React.PureComponent<LangCodeListProps> {
  render () {
    const { langs, t } = this.props
    return langs.split('').map((c, i) => {
      if (+c) {
        return <span className='langcode-list-char' key={langCodes[i]}>{
          t(`dict_lang_${langCodes[i]}`)
        }</span>
      }
    })
  }
}
