import React, { FC } from 'react'
import { JukuuResult, JukuuPayload, JukuuLang } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { useTranslate } from '@/_helpers/i18n'

export const DictJukuu: FC<ViewPorps<JukuuResult>> = props => {
  const { result, searchText } = props
  const { t } = useTranslate('dicts')
  return (
    <>
      <select
        style={{ width: '100%' }}
        onChange={e => {
          if (e.target.value) {
            searchText<JukuuPayload>({
              id: 'jukuu',
              payload: {
                lang: e.target.value as JukuuLang
              }
            })
          }
        }}
      >
        <option value="zheng" selected={result.lang === 'zheng'}>
          {t('jukuu.options.lang-zheng')}
        </option>
        <option value="engjp" selected={result.lang === 'engjp'}>
          {t('jukuu.options.lang-engjp')}
        </option>
        <option value="zhjp" selected={result.lang === 'zhjp'}>
          {t('jukuu.options.lang-zhjp')}
        </option>
      </select>
      <ul className="dictJukuu-Sens">
        {result.sens.map((sen, i) => (
          <li key={i} className="dictJukuu-Sen">
            <p dangerouslySetInnerHTML={{ __html: sen.trans }} />
            <p className="dictJukuu-Ori">{sen.original}</p>
            <p className="dictJukuu-Src">{sen.src}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

export default DictJukuu
