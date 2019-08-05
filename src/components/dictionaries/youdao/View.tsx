import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { YoudaoResult, YoudaoResultLex, YoudaoResultRelated } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import EntryBox from '@/components/EntryBox'

export const DictYoudao: FC<ViewPorps<YoudaoResult>> = ({ result }) => {
  switch (result.type) {
    case 'lex':
      return renderLex(result)
    case 'related':
      return renderRelated(result)
    default:
      return null
  }
}

export default DictYoudao

function renderLex(result: YoudaoResultLex) {
  return (
    <>
      {result.title && (
        <div className="dictYoudao-HeaderContainer">
          <h1 className="dictYoudao-Title">{result.title}</h1>
          <span className="dictYoudao-Pattern">{result.pattern}</span>
        </div>
      )}
      {(result.stars > 0 || result.prons.length > 0) && (
        <div className="dictYoudao-HeaderContainer">
          {result.stars > 0 && (
            <StarRates className="dictYoudao-Stars" rate={result.stars} />
          )}
          {result.prons.map(({ phsym, url }) => (
            <React.Fragment key={url}>
              {phsym} <Speaker src={url} />
            </React.Fragment>
          ))}
          <span className="dictYoudao-Rank">{result.rank}</span>
        </div>
      )}
      {result.basic && (
        <div
          className="dictYoudao-Basic"
          dangerouslySetInnerHTML={{ __html: result.basic }}
        />
      )}
      {result.collins && (
        <EntryBox title="柯林斯英汉双解">
          <ul
            className="dictYoudao-Collins"
            dangerouslySetInnerHTML={{ __html: result.collins }}
          />
        </EntryBox>
      )}
      {result.discrimination && (
        <div className="dictYoudao-Discrimination">
          <h1 className="dictYoudao-Discrimination_Title">词义辨析</h1>
          <div dangerouslySetInnerHTML={{ __html: result.discrimination }} />
        </div>
      )}
      {result.sentence && (
        <EntryBox title="权威例句">
          <ol
            className="dictYoudao-Sentence"
            dangerouslySetInnerHTML={{ __html: result.sentence }}
          />
        </EntryBox>
      )}
      {result.translation && (
        <EntryBox title="机器翻译">
          <div
            className="dictYoudao-Translation"
            dangerouslySetInnerHTML={{ __html: result.translation }}
          />
        </EntryBox>
      )}
    </>
  )
}

function renderRelated(result: YoudaoResultRelated) {
  return (
    <div
      className="dictYoudao-Related"
      dangerouslySetInnerHTML={{ __html: result.list }}
    />
  )
}
