import React, { FC, useState } from 'react'
import { Speaker } from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { COBUILDResult, COBUILDCibaResult, COBUILDColResult } from './engine'
import {
  ViewPorps,
  useHorizontalScroll
} from '@/components/dictionaries/helpers'

export const DictCOBUILD: FC<ViewPorps<COBUILDResult>> = ({ result }) => {
  switch (result.type) {
    case 'ciba':
      return renderCiba(result)
    case 'collins':
      return renderCol(result)
  }
  return null
}

export default DictCOBUILD

function renderCiba(result: COBUILDCibaResult) {
  return (
    <>
      <h1 className="dictCOBUILD-Title">{result.title}</h1>
      {result.prons && (
        <ul className="dictCOBUILD-Pron">
          {result.prons.map(p => (
            <li key={p.phsym} className="dictCOBUILD-PronItem">
              {p.phsym}
              <Speaker src={p.audio} />
            </li>
          ))}
        </ul>
      )}
      <div className="dictCOBUILD-Rate">
        {(result.star as number) >= 0 && <StarRates rate={result.star} />}
        {result.level && (
          <span className="dictCOBUILD-Level">{result.level}</span>
        )}
      </div>
      {result.defs && (
        <ol className="dictCOBUILD-Defs">
          {result.defs.map((def, i) => (
            <li
              className="dictCOBUILD-Def"
              key={i}
              dangerouslySetInnerHTML={{ __html: def }}
            />
          ))}
        </ol>
      )}
    </>
  )
}

function renderCol(result: COBUILDColResult) {
  const [curSection, setCurSection] = useState(result.sections[0])
  const tabsRef = useHorizontalScroll<HTMLDivElement>()

  return (
    <div className="dictCOBUILD-ColEntry">
      <div className="dictionary">
        <div className="dc">
          <div className="navigation">
            <div className="tabsNavigation" ref={tabsRef}>
              {result.sections.map(section => (
                <a
                  key={section.id}
                  className={`tab${
                    section.id === curSection.id ? ' current' : ''
                  }`}
                  href="#"
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    setCurSection(section)
                  }}
                >
                  {section.type}
                  {section.title ? ` :${section.title}` : ''}
                  {section.num ? (
                    <span className="expo">{section.num}</span>
                  ) : (
                    ''
                  )}
                </a>
              ))}
            </div>
          </div>
          <div className="he">
            <div className="page">
              <div className="dictionary">
                <div className="dictentry">
                  <div className="dictlink">
                    <div
                      key={curSection.id}
                      className={curSection.className}
                      dangerouslySetInnerHTML={{ __html: curSection.content }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
