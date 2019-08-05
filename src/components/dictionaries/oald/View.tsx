import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { OALDResult, OALDResultLex, OALDResultRelated } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictOALD: FC<ViewPorps<OALDResult>> = ({ result }) => {
  switch (result.type) {
    case 'lex':
      return renderLex(result)
    case 'related':
      return renderRelated(result)
    default:
      return null
  }
}

function renderLex(result: OALDResultLex) {
  return (
    <>
      {result.items.map(entry => (
        <section
          key={entry.title}
          className="dictOALD-Entry"
          onClick={e => {
            const target = e.nativeEvent.target as HTMLSpanElement
            if (target.classList && target.classList.contains('heading')) {
              ;(target.parentElement as HTMLDivElement).classList.toggle(
                'is-active'
              )
            }
          }}
        >
          <header className="dictOALD-Header">
            <div
              className="webtop-g"
              dangerouslySetInnerHTML={{ __html: entry.title }}
            />
            {entry.prons.length > 0 && (
              <div className="pron-gs ei-g">
                {entry.prons.map(p => (
                  <React.Fragment key={p.phsym}>
                    <span
                      className="pron-g"
                      dangerouslySetInnerHTML={{ __html: p.phsym }}
                    />
                    <Speaker src={p.pron} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </header>
          <span
            className="h-g"
            dangerouslySetInnerHTML={{ __html: entry.defs }}
          />
        </section>
      ))}
    </>
  )
}

function renderRelated(result: OALDResultRelated) {
  return (
    <>
      <p>Did you mean:</p>
      <ul
        className="dictOALD-Related"
        dangerouslySetInnerHTML={{ __html: result.list }}
      />
    </>
  )
}

export default DictOALD
