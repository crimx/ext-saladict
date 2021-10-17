import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { OaldictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StrElm } from '@/components/StrElm'

export const DictOal: FC<ViewPorps<OaldictResult>> = ({ result }) => (
  <div>
    <div className={'dictOal-TopContainer'}>
      {/* title */}
      <div className={'dictOal-TitleBox'}>
        <span className={'dictOal-TitleBoxT'}>{result.title}</span>
        {result.pos && (
          <span className={'dictOal-TitleBoxPos'}>({result.pos})</span>
        )}
        {result.symbol && (
          <span className={'dictOal-TitleBoxSymbol'}>{result.symbol}</span>
        )}
      </div>

      {/* pron */}
      <div className={'dictOal-Phonetics'}>
        {result.pron.uk.sound && (
          <div className={'dictOal-PhonsUK'}>
            <span className={'dictOal-PhonsCountry'}>UK</span>
            <Speaker src={result.pron.uk.sound} />
            <span>{result.pron.uk.phon}</span>
          </div>
        )}
        {result.pron.us.sound && (
          <div className={'dictOal-PhonsUS'}>
            <span className={'dictOal-PhonsCountry'}>US</span>
            <Speaker src={result.pron.us.sound} />
            <span>{result.pron.us.phon}</span>
          </div>
        )}
      </div>
    </div>

    {/* senses */}
    {!!result.senses.length && (
      <ol className={'dictOal-SensesMultiple'}>
        {result.senses.map((sense, senseI) => {
          return (
            <div key={senseI}>
              {sense.title && (
                <div className={'dictOal-SensesTitle'}>{sense.title}</div>
              )}
              {sense.means.map((mean, meanI) => {
                return (
                  <li key={meanI}>
                    {mean.symbols && (
                      <span className={'dictOal-SensesSymbols'}>
                        {mean.symbols}
                      </span>
                    )}
                    {mean.variants && !mean.variantsIsBlock && (
                      <StrElm
                        tag="span"
                        className="dictOal-SensesVariants"
                        html={mean.variants || ''}
                      />
                    )}
                    {mean.grammar && (
                      <span className={'dictOal-SensesGrammar'}>
                        {mean.grammar}
                      </span>
                    )}
                    {mean.labels && (
                      <span className={'dictOal-SensesLabels'}>
                        {mean.labels}
                      </span>
                    )}
                    {mean.variants && mean.variantsIsBlock && (
                      <StrElm
                        className="dictOal-SensesVariants"
                        html={mean.variants || ''}
                      />
                    )}
                    {mean.use && <div>{mean.use}</div>}

                    {mean.cf && (
                      <span className={'dictOal-SensesCf'}>{mean.cf}</span>
                    )}
                    <span>{mean.def}</span>
                    <StrElm
                      tag="p"
                      className="dictOal-MeanExamples"
                      html={mean.examples || ''}
                    />
                  </li>
                )
              })}
            </div>
          )
        })}
      </ol>
    )}

    {/* origin */}
    {result.origin && (
      <div className={'dictOal-Origin'}>
        <span className={'dictOal-OriginTitle'}>Origin</span>
        <StrElm
          tag="p"
          className="dictOal-OriginMean"
          html={result.origin || ''}
        />
      </div>
    )}

    {/* idioms */}
    {!!result.idioms.length && (
      <div className={'dictOal-Idioms'}>
        <div className={'dictOal-IdiomsT'}>Idioms</div>
        {result.idioms.map((idiom, idiomI) => (
          <div key={idiomI}>
            <div>
              <span className={'dictOal-IdiomsTitle'}>{idiom.title}</span>
            </div>
            <div>
              {idiom.labels && (
                <span className={'dictOal-IdiomsLabels'}>{idiom.labels}</span>
              )}
              {idiom.def}
            </div>
            <StrElm
              className="dictOal-IdiomsExamples"
              html={idiom.examples || ''}
            />
          </div>
        ))}
      </div>
    )}
  </div>
)

export default DictOal
