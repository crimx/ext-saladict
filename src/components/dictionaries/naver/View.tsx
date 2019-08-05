import React, { FC } from 'react'
import { NaverResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictNaver: FC<ViewPorps<NaverResult>> = props => (
  <>
    <select
      style={{ width: '100%' }}
      onChange={e =>
        props.searchText({
          id: 'naver',
          payload: { lang: e.target.value }
        })
      }
      value={props.result.lang}
    >
      <option key="zh" value="zh">
        中韩
      </option>
      <option key="ja" value="ja">
        日韓
      </option>
    </select>
    <div
      className={`dictNaver-Entry-${props.result.lang}`}
      dangerouslySetInnerHTML={{ __html: props.result.entry }}
    />
  </>
)

export default DictNaver
