import React from 'react'
import Speaker from '@/components/Speaker'
import { ZdicResult } from './engine'

export default class DictZdic extends React.PureComponent<{ result: ZdicResult }> {
  render () {
    const { defs, phsym } = this.props.result
    return (
      <>
        <ul className='dictZdic-Phsym'>
          {phsym.map(p => (
            <li key={p.pron} className='dictZdic-PhsymItem'>
              {p.pinyin} <Speaker src={p.pron} />
            </li>
          ))}
        </ul>
        <div className='dictZdic-Defs' dangerouslySetInnerHTML={{ __html: defs }} />
      </>
    )
  }
}
