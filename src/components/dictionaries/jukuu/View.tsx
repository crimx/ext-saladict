import React from 'react'
import { JukuuResult, JukuuPayload, JukuuLang } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictJukuu extends React.PureComponent<ViewPorps<JukuuResult>> {
  handleSelectChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      this.props.searchText<JukuuPayload>({
        id: 'jukuu',
        payload: {
          lang: e.target.value as JukuuLang
        },
      })
    }
  }

  render () {
    const { result, t } = this.props
    return (
      <>
        <select
          style={{ width: '100%' }}
          onChange={this.handleSelectChanged}
        >
          <option value='zheng' selected={result.lang === 'zheng'}>{t('dict:jukuu_lang-zheng')}</option>
          <option value='engjp' selected={result.lang === 'engjp'}>{t('dict:jukuu_lang-engjp')}</option>
          <option value='zhjp' selected={result.lang === 'zhjp'}>{t('dict:jukuu_lang-zhjp')}</option>
        </select>
        <ul className='dictJukuu-Sens'>
          {result.sens.map((sen, i) => (
            <li key={i} className='dictJukuu-Sen'>
              <p dangerouslySetInnerHTML={{ __html: sen.trans }} />
              <p className='dictJukuu-Ori'>{sen.original}</p>
              <p className='dictJukuu-Src'>{sen.src}</p>
            </li>
          ))}
        </ul>
      </>
    )
  }
}
