import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { AhdictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictAh: FC<ViewPorps<AhdictResult>> = ({ result }) => (
  <div>
    {result.map((res, resI) => {
      return (
        <div className="dictAh-WordBox" key={resI}>
          {/* keywords and pronunciation */}
          <div className="dictAh-Title">
            <span>{res.title}</span>
            {res.pron && <Speaker src={res.pron} />}
          </div>

          {/* meaning and eg */}
          {res.meaning &&
            res.meaning.map((m, mI) => (
              <div
                key={mI}
                className="dictAh-Meaning"
                dangerouslySetInnerHTML={{ __html: m }}
              />
            ))}

          {/* idioms and eg */}
          {res.idioms && !!res.idioms.length && (
            <>
              <div className="dictAh-idiomTitle">
                {res.idioms.length > 1 ? 'idioms' : 'idiom'}
              </div>
              {res.idioms.map((idiom, idiomI) => (
                <div key={`${idiom.title}--${idiomI}`}>
                  <div>
                    <span className="dictAh-idiomWords">{idiom.title}</span>
                    {idiom.tips ? `(${idiom.tips})` : null}
                  </div>
                  <div className="dictAh-idiomEg">{idiom.eg}</div>
                </div>
              ))}
            </>
          )}

          {/* words origin */}
          {res.origin && (
            <>
              <div className="dictAh-Hr" role="separator" />
              <p
                className="dictAh-origin"
                dangerouslySetInnerHTML={{ __html: res.origin }}
              />
            </>
          )}

          {/* words usage note */}
          {res.usageNote && (
            <p
              className="dictAh-UsageNote"
              dangerouslySetInnerHTML={{ __html: res.usageNote }}
            />
          )}
        </div>
      )
    })}
  </div>
)

export default DictAh
