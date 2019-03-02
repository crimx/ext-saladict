import React from 'react'
import { NaverResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictNaver extends React.PureComponent<ViewPorps<NaverResult>> {
  langSelectList = [
    ['zh', '中韩'],
    ['ja', '日韩'],
  ]

  render () {
    const { lang, entry } = this.props.result

    return (
      <>
        <select
          style={{ width: '100%' }}
          onChange={e => this.props.searchText({
            id: 'naver',
            payload: { lang: e.target.value },
          })}
        >
          {this.langSelectList.map(([langCode, locale]) => (
            <option key={langCode} value={langCode} selected={lang === langCode}>
              {locale}
            </option>
          ))}
        </select>
        <div
          className={`dictNaver-Entry-${lang}`}
          dangerouslySetInnerHTML={{ __html: entry }}
        />
      </>
    )
  }
}
