import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import {
  WebsterLearnerResult,
  WebsterLearnerResultLex,
  WebsterLearnerResultRelated
} from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

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
            <span
              className="hw_d hw_0"
              dangerouslySetInnerHTML={{ __html: entry.title }}
            />
            <Speaker src={entry.pron} />
          </header>
          {entry.infs && (
            <div className="dictWebsterLearner-Header">
              <span
                className="hw_infs_d"
                dangerouslySetInnerHTML={{ __html: entry.infs }}
              />
              <Speaker src={entry.infsPron} />
            </div>
          )}
          {entry.labels && (
            <div
              className="labels"
              dangerouslySetInnerHTML={{ __html: entry.labels }}
            />
          )}
          {entry.senses && (
            <div
              className="sblocks"
              dangerouslySetInnerHTML={{ __html: entry.senses }}
            />
          )}
          {entry.arts &&
            entry.arts.length > 0 &&
            entry.arts.map(src => <img key={src} src={src} />)}
          {entry.phrases && (
            <div
              className="dros"
              dangerouslySetInnerHTML={{ __html: entry.phrases }}
            />
          )}
          {entry.derived && (
            <div
              className="uros"
              dangerouslySetInnerHTML={{ __html: entry.derived }}
            />
          )}
        </section>
      ))}
    </>
  )
}

function renderRelated(result: WebsterLearnerResultRelated) {
  return (
    <>
      <p>Did you mean:</p>
      <ul
        className="dictWebsterLearner-Related"
        dangerouslySetInnerHTML={{ __html: result.list }}
      />
    </>
  )
}

export default DictWebsterLearner
