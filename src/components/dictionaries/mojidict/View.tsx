import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import EntryBox from '@/components/EntryBox'
import { MojidictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictMojidict: FC<ViewPorps<MojidictResult>> = ({ result }) => (
  <>
    {result.word && (
      <div>
        <h1>{result.word.spell}</h1>
        <span>{result.word.pron}</span> <Speaker src={result.word.tts} />
      </div>
    )}
    {result.details &&
      result.details.map(detail => (
        <EntryBox key={detail.title} title={detail.title}>
          {detail.subdetails && (
            <ul className="dictMojidict-List">
              {detail.subdetails.map(subdetail => (
                <li
                  key={subdetail.title}
                  className="dictMojidict-ListItem_Disc"
                >
                  <p>{subdetail.title}</p>
                  {subdetail.examples && (
                    <ul className="dictMojidict-Sublist">
                      {subdetail.examples.map(example => (
                        <li key={example.title}>
                          <p className="dictMojidict-Word_Title">
                            {example.title}
                          </p>
                          <p className="dictMojidict-Word_Trans">
                            {example.trans}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </EntryBox>
      ))}
    {result.releated && (
      <EntryBox title="関連用語">
        <ul className="dictMojidict-List">
          {result.releated.map(word => (
            <li key={word.title}>
              <p className="dictMojidict-Word_Title">{word.title}</p>
              <p className="dictMojidict-Word_Trans">{word.excerpt}</p>
            </li>
          ))}
        </ul>
      </EntryBox>
    )}
  </>
)

export default DictMojidict
