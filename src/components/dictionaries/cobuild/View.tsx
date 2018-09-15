import React from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { COBUILDResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictCOBUILD extends React.PureComponent<ViewPorps<COBUILDResult>> {
  render () {
    const { result } = this.props
    return (
      <>
        <h1 className='dictCOBUILD-Title'>{result.title}</h1>
        {result.prons &&
          <ul className='dictCOBUILD-Pron'>
            {result.prons.map(p => (
              <li key={p.phsym} className='dictCOBUILD-PronItem'>
                {p.phsym}
                <Speaker src={p.audio} />
              </li>
            ))}
          </ul>
        }
        <div className='dictCOBUILD-Rate'>
          {result.star as number >= 0 &&
            <StarRates rate={result.star} />
          }
          {result.level &&
            <span className='dictCOBUILD-Level'>{result.level}</span>
          }
        </div>
        {result.defs &&
          <ol className='dictCOBUILD-Defs'>
            {result.defs.map((def, i) => (
              <li className='dictCOBUILD-Def'
                key={i}
                dangerouslySetInnerHTML={{ __html: def }}
              />
            ))}
          </ol>
        }
      </>
    )
  }
}
