import React from 'react'
import Speaker from '@/components/Speaker'
import { BingResult, BingResultLex, BingResultMachine, BingResultRelated } from './engine'

export default class DictBing extends React.PureComponent<{ result: BingResult }> {
  renderLex () {
    const result = this.props.result as BingResultLex
    return (
      <>
        <h1 className='dictBing-Title'>{result.title}</h1>

        {result.phsym &&
          <ul className='dictBing-Phsym'>
            {result.phsym.map(p => (
              <li className='dictBing-PhsymItem' key={p.lang + p.pron}>
                {p.lang} <Speaker src={p.pron} />
              </li>
            ))}
          </ul>
        }

        {result.cdef &&
          <ul className='dictBing-Cdef'>
            {result.cdef.map(d => (
              <li className='dictBing-CdefItem' key={d.pos}>
                <span className='dictBing-CdefItem_Pos'>{d.pos}</span>
                <span className='dictBing-CdefItem_Def'>{d.def}</span>
              </li>
            ))}
          </ul>
        }

        {result.infs &&
          <ul className='dictBing-Inf'>
            词形：
            {result.infs.map(inf => (
              <li className='dictBing-InfItem' key={inf}>
                {inf}
              </li>
            ))}
          </ul>
        }

        {result.sentences &&
          <ol className='dictBing-SentenceList'>
            {result.sentences.map(sen => (
              <li className='dictBing-SentenceItem' key={sen.en}>
                {sen.en && <p>{sen.en} <Speaker src={sen.mp3}></Speaker></p>}
                {sen.chs && <p>{sen.chs}</p>}
                {sen.source && <footer className='dictBing-SentenceSource'>{sen.source}</footer>}
              </li>
            ))}
          </ol>
        }
      </>
    )
  }

  renderMachine () {
    const result = this.props.result as BingResultMachine
    return <p>{result.mt}</p>
  }

  renderRelated () {
    const result = this.props.result as BingResultRelated
    return (
      <>
        <h1 className='dictBing-Related_Title'>{result.title}</h1>
        {result.defs.map(def => (
          <React.Fragment key={def.title}>
            <h2 className='dictBing-Related_Title'>{def.title}</h2>
            <ul>
              {def.meanings.map(meaning => (
                <li className='dictBing-Related_Meaning' key={meaning.word}>
                  <a className='dictBing-Related_Meaning_Word' href={meaning.href}>{meaning.word}</a>
                  <span className='dictBing-Related_Meaning_Def'>{meaning.def}</span>
                </li>
              ))}
            </ul>
          </React.Fragment>
        ))}
      </>
    )
  }

  render () {
    switch (this.props.result.type) {
      case 'lex':
        return this.renderLex()
      case 'machine':
        return this.renderMachine()
      case 'related':
        return this.renderRelated()
      default:
        return null
    }
  }
}
