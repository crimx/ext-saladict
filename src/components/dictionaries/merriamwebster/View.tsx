import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { MerriamWebsterResultV2 } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictMerriamWebster: FC<ViewPorps<MerriamWebsterResultV2>> = ({
  result
}) => (
  // <ul className="mw-list">
  <ul>
    {result.groups.map((g, i) => (
      <li key={`${`mw-g`}-${i}`} className="mw-item">
        <div className="mw-top-container">
          <div className="mw-title-area">
            {/* <sup className="mw-Sup">{i + 1}</sup> */}
            <span className="mw-title">{g.title}</span>
            <span className="mw-pos">({g.pos})</span>
          </div>
          <div className="mw-prs">
            {g.pr?.syllable && (
              <span className="mw-syllable">{g.pr?.syllable}</span>
            )}
            {g.pr?.phonetics &&
              g.pr?.phonetics.map((v, j) => (
                <div
                  key={'mw-pt-' + j}
                  className={v.audio ? 'mw-pt' : 'mw-pt-text'}
                >
                  {v.symbol}
                  {v.audio && <Speaker src={v.audio} />}
                </div>
              ))}
          </div>
        </div>

        {g.sections.map((s, n) => (
          <div key={'mw-section-' + n} className="mw-section">
            {s.title && <div className="mw-section-title">{s.title}</div>}
            <div>
              {s.meaningGroups.map((means, o) => (
                <div key={'mw-mg-' + o} className="mw-mg-area">
                  <div className="mw-mg-left">
                    <div className="mw-mg-sign"> {o + 1}</div>
                    <div className="mw-mg-line"></div>
                  </div>

                  <div className="mw-mg-right">
                    {means.map((mean, k) => (
                      <div key={'mw-meaning-' + k} className="mw-mean-area">
                        {(mean.examples || mean.explaining) &&
                          means.length > 1 && (
                            <span className="mw-mean-sign">
                              {String.fromCharCode(k + 97)}
                            </span>
                          )}

                        {mean.explaining && (
                          <div className="mw-mean-text">{mean.explaining}</div>
                        )}

                        {mean.examples && (
                          <div className="mw-mean-ex-area">
                            {mean.examples?.map((ex, m) => (
                              <div
                                key={'mw-example-' + m}
                                className="mw-mean-ex-item"
                              >
                                {ex}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </li>
    ))}

    {result.etymology && (
      <li>
        <div className="mw-extra mw-title-area">
          <div className="mw-extra-title mw-title">Etymology</div>
          {result.etymology?.map((v, i) => (
            <div key={'mw-etymolog' + i}>
              {v[0] && <div className="mw-section-title">{v[0]}</div>}
              <div>{v[1]}</div>
            </div>
          ))}
        </div>
      </li>
    )}

    {result.synonyms && (
      <li>
        <div className="mw-extra mw-title-area">
          <div className="mw-extra-title mw-title">Synonyms</div>
          {result.synonyms?.map((v, i) => (
            <div key={'mw-etymolog' + i}>
              {v[0] && <div className="mw-section-title">{v[0]}</div>}
              <div>{v[1].join('; ')}</div>
            </div>
          ))}
        </div>
      </li>
    )}
  </ul>
)

export default DictMerriamWebster
