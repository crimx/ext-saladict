import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { AhdictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StrElm } from '@/components/StrElm'

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
              <StrElm key={mI} className="dictAh-Meaning" html={m} />
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
              <StrElm tag="p" className="dictAh-origin" html={res.origin} />
            </>
          )}

          {/* words usage note */}
          {res.usageNote && (
            <StrElm tag="p" className="dictAh-UsageNote" html={res.usageNote} />
          )}
        </div>
      )
    })}
  </div>
)

export default DictAh
