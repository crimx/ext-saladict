import React from 'react'
import Speaker from '@/components/Speaker'
import { ShanbayResult, ShanbayResultLex } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictShanbay extends React.PureComponent<ViewPorps<ShanbayResult>> {
  renderLex (result: ShanbayResultLex) {
    return (
      <>
        {result.title &&
          <div className='dictShanbay-HeaderContainer'>
            <h1 className='dictShanbay-Title'>{result.title}</h1>
            <span className='dictShanbay-Pattern'>{result.pattern}</span>
          </div>
        }
        {result.prons.length > 0 &&
          <div className='dictShanBay-HeaderContainer'>
            {result.prons.map(({ phsym, url }) => (
              <React.Fragment key={url}>
                {phsym} <Speaker src={url} />
              </React.Fragment>
            ))}
          </div>
        }
        {result.basic &&
          <div className='dictShanbay-Basic' dangerouslySetInnerHTML={{ __html: result.basic }} />
        }
        {result.sentences &&
          <div>
            <h1 className='dictShanbay-SecTitle'>权威例句</h1>
            <ol className='dictShanbay-Sentence'>
            { this.renderSentences(result.sentences) }
            </ol>
          </div>
        }
      </>
    )
  }

  renderSentences (sentences) {
    return sentences.map((sentence: {
      annotation: string,
      translation: string,
    }) => {
      return (<li>
        <p dangerouslySetInnerHTML={{ __html: sentence.annotation }} />
        <p>{ sentence.translation }</p>
      </li>)
    })
  }

  render () {
    const { result } = this.props
    switch (result.type) {
      case 'lex':
        return this.renderLex(result)
      default:
        return null
    }
  }
}
