import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import {
  WebsterLearnerResult,
  WebsterLearnerResultLex,
  WebsterLearnerResultRelated
} from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StrElm } from '@/components/StrElm'

export const DictWebsterLearner: FC<ViewPorps<WebsterLearnerResult>> = ({
  result
}) => {
  switch (result.type) {
    case 'lex':
      return renderLex(result)
    case 'related':
      return renderRelated(result)
    default:
      return null
  }
}

function renderLex(result: WebsterLearnerResultLex) {
  return (
    <>
      {result.items.map(entry => (
        <section key={entry.title} className="dictWebsterLearner-Entry">
          <header className="dictWebsterLearner-Header">
            <StrElm tag="span" className="hw_d hw_0" html={entry.title} />
            <Speaker src={entry.pron} />
          </header>
          {entry.infs && (
            <div className="dictWebsterLearner-Header">
              <StrElm tag="span" className="hw_infs_d" html={entry.infs} />
              <Speaker src={entry.infsPron} />
            </div>
          )}
          {entry.labels && <StrElm className="labels" html={entry.labels} />}
          {entry.senses && <StrElm className="sblocks" html={entry.senses} />}
          {entry.arts &&
            entry.arts.length > 0 &&
            entry.arts.map(src => <img key={src} src={src} />)}
          {entry.phrases && <StrElm className="dros" html={entry.phrases} />}
          {entry.derived && <StrElm className="uros" html={entry.derived} />}
        </section>
      ))}
    </>
  )
}

function renderRelated(result: WebsterLearnerResultRelated) {
  return (
    <>
      <p>Did you mean:</p>
      <StrElm
        tag="ul"
        className="dictWebsterLearner-Related"
        html={result.list}
      />
    </>
  )
}

export default DictWebsterLearner
