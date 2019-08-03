import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import {
  BingResult,
  BingResultLex,
  BingResultMachine,
  BingResultRelated
} from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictBing: FC<ViewPorps<BingResult>> = ({ result }) => {
  switch (result.type) {
    case 'lex':
      return renderLex(result)
    case 'machine':
      return renderMachine(result)
    case 'related':
      return renderRelated(result)
    default:
      return null
  }
}

export default DictBing

function renderLex(result: BingResultLex) {
  return (
    <>
      <h1 className="dictBing-Title">{result.title}</h1>

      {result.phsym && (
        <ul className="dictBing-Phsym">
          {result.phsym.map(p => (
            <li className="dictBing-PhsymItem" key={p.lang + p.pron}>
              {p.lang} <Speaker src={p.pron} />
            </li>
          ))}
        </ul>
      )}

      {result.cdef && (
        <ul className="dictBing-Cdef">
          {result.cdef.map(d => (
            <li className="dictBing-CdefItem" key={d.pos}>
              <span className="dictBing-CdefItem_Pos">{d.pos}</span>
              <span className="dictBing-CdefItem_Def">{d.def}</span>
            </li>
          ))}
        </ul>
      )}

      {result.infs && (
        <ul className="dictBing-Inf">
          词形：
          {result.infs.map(inf => (
            <li className="dictBing-InfItem" key={inf}>
              {inf}
            </li>
          ))}
        </ul>
      )}

      {result.sentences && (
        <ol className="dictBing-SentenceList">
          {result.sentences.map(sen => (
            <li className="dictBing-SentenceItem" key={sen.en}>
              {sen.en && (
                <p>
                  <span dangerouslySetInnerHTML={{ __html: sen.en }} />{' '}
                  <Speaker src={sen.mp3}></Speaker>
                </p>
              )}
              {sen.chs && <p dangerouslySetInnerHTML={{ __html: sen.chs }} />}
              {sen.source && (
                <footer className="dictBing-SentenceSource">
                  {sen.source}
                </footer>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

function renderMachine(result: BingResultMachine) {
  return <p>{result.mt}</p>
}

function renderRelated(result: BingResultRelated) {
  return (
    <>
      <h1 className="dictBing-Related_Title">{result.title}</h1>
      {result.defs.map(def => (
        <React.Fragment key={def.title}>
          <h2 className="dictBing-Related_Title">{def.title}</h2>
          <ul>
            {def.meanings.map(meaning => (
              <li className="dictBing-Related_Meaning" key={meaning.word}>
                <a
                  className="dictBing-Related_Meaning_Word"
                  href={meaning.href}
                >
                  {meaning.word}
                </a>
                <span className="dictBing-Related_Meaning_Def">
                  {meaning.def}
                </span>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </>
  )
}
