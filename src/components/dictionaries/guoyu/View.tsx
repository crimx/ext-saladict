import React from 'react'
import { GuoYuResult } from './engine'
import Speaker from '@/components/Speaker'

export default class DictGuoyu extends React.PureComponent<{ result: GuoYuResult }> {
  render () {
    const result = this.props.result
    return (
      <>
        {result.h && result.h.map(h => (
          <div className='dictMoe-H' key={h.p}>
            <h1 className='dictMoe-Title'>{replaceLink(result.t)}</h1>
            <span className='dictMoe-Pinyin'>{h.p || ''}</span>
            <Speaker src={h['=']}></Speaker>
            {h.d &&
              <ol className='dictMoe-Defs'>
              {h.d.map(defs => (
                <li key={defs.f}>
                  <p className='dictMoe-Defs_F'>{replaceLink(defs.f)}</p>
                  {defs.e && defs.e.map(e => (
                    <p key={e} className='dictMoe-Defs_E'>{replaceLink(e)}</p>
                  ))}
                </li>
              ))}
              </ol>
            }
          </div>
        ))}

        {result.translation &&
          <>
            {result.translation.English &&
              <div className='dictMoe-Trans'>
                <span className='dictMoe-Trans_Pos'>英.</span>
                <span className='dictMoe-Trans_Def'>{result.translation.English.join(', ')}</span>
              </div>
            }
            {result.translation.francais &&
              <div className='dictMoe-Trans'>
                <span className='dictMoe-Trans_Pos'>法.</span>
                <span className='dictMoe-Trans_Def'>{result.translation.francais.join(', ')}</span>
              </div>
            }
            {result.translation.Deutsch &&
              <div className='dictMoe-Trans'>
                <span className='dictMoe-Trans_Pos'>德.</span>
                <span className='dictMoe-Trans_Def'>{result.translation.Deutsch.join(', ')}</span>
              </div>
            }
          </>
        }
      </>
    )
  }
}

function replaceLink (text: string) {
  if (!text) { return '' }
  return text.split(/`(.*?)~/g)
    .map((word, i) => i % 2 === 0
      ? word.replace('例⃝', '')
      : <a key={i} className='dictMoe-Link' href={`https://www.moedict.tw/${word}`}>{word}</a>
    )
}
