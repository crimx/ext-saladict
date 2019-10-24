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
            <ul className="dictMojidict-Subdetails">
              {detail.subdetails.map(subdetail => (
                <li
                  key={subdetail.title}
                  className="dictMojidict-Subdetails_Item"
                >
                  <p>{subdetail.title}</p>
                  {subdetail.examples && (
                    <ul className="dictMojidict-Examples">
                      {subdetail.examples.map(example => (
                        <li key={example.title}>
                          <p className="dictMojidict-Examples_Title">
                            {example.title}
                          </p>
                          <p className="dictMojidict-Examples_Trans">
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
  </>
)

export default DictMojidict
