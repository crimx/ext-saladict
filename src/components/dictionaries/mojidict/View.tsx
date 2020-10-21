import React, { FC } from 'react'
import { PromiseType } from 'utility-types'
import Speaker from '@/components/Speaker'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { message } from '@/_helpers/browser-api'
import { MojidictResult, GetTTS } from './engine'

export const DictMojidict: FC<ViewPorps<MojidictResult>> = ({ result }) => (
  <>
    {result.word && (
      <div>
        <h1>{result.word.spell}</h1>
        <span>{result.word.pron}</span>{' '}
        <Speaker
          src={
            result.word.tts ||
            (() =>
              message.send<
                'DICT_ENGINE_METHOD',
                PromiseType<ReturnType<GetTTS>>
              >({
                type: 'DICT_ENGINE_METHOD',
                payload: {
                  id: 'mojidict',
                  method: 'getTTS',
                  args: [result.word?.tarId, 102]
                }
              }))
          }
        />
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
                            <Speaker
                              src={() =>
                                message.send<
                                  'DICT_ENGINE_METHOD',
                                  PromiseType<ReturnType<GetTTS>>
                                >({
                                  type: 'DICT_ENGINE_METHOD',
                                  payload: {
                                    id: 'mojidict',
                                    method: 'getTTS',
                                    args: [example.objectId, 103]
                                  }
                                })
                              }
                            />
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
