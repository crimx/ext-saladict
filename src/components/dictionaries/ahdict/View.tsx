import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { AhdictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictAh: FC<ViewPorps<AhdictResult>> = ({ result }) => {
  // console.log(result, '---===---')
  return (
    <div>
      {result.map((res, resI) => {
        return (
          <div className="dictAh-WordBox" key={resI}>
            {/* keywords */}
            <div className="dictAh-Title">
              <span>{res.title}</span>
              <sup>{res.sup}</sup>
              {res.pron && (
                <>
                  <Speaker src={res.pron.src} />
                  <span
                    className="dictAh-pronSymble"
                    dangerouslySetInnerHTML={{ __html: res.pron.title }}
                  />
                </>
              )}
            </div>

            {/* meaning */}
            {res.meaning &&
              res.meaning.map((p, pI) => (
                <div
                  key={pI}
                  className="dictAh-Meaning"
                  dangerouslySetInnerHTML={{ __html: p }}
                />
              ))}

            {/* idiom */}
            {res.idioms && !!res.idioms.length && (
              <>
                <div className="dictAh-idiomTitle">
                  {res.idioms.length > 1 ? 'idioms' : 'idiom'}
                </div>
                {res.idioms.map((idiom, idiomI) => (
                  <div key={idiomI}>
                    <div>
                      <span className="dictAh-idiomKeyword">{idiom.title}</span>
                      {idiom.tips ? `(${idiom.tips})` : null}
                    </div>
                    <div className="dictAh-idiomEg">{idiom.eg}</div>
                  </div>
                ))}
              </>
            )}

            {/* word origin */}
            {res.origin && (
              <>
                <div className="dictAh-Hr" role="separator" />
                <p
                  className="dictAh-origin"
                  dangerouslySetInnerHTML={{ __html: res.origin }}
                />
              </>
            )}

            {/* word usageNote */}
            {res.usageNote && (
              <>
                <p
                  className="dictAh-UsageNote"
                  dangerouslySetInnerHTML={{ __html: res.usageNote }}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DictAh
