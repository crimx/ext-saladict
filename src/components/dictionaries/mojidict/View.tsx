import React, { FC } from 'react'
import { PromiseType } from 'utility-types'
import Speaker from '@/components/Speaker'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { message } from '@/_helpers/browser-api'
import { newWord } from '@/_helpers/record-manager'
import { MojidictResult, GetTTS } from './engine'

export const DictMojidict: FC<ViewPorps<MojidictResult>> = props => (
  <>
    {props.result.word && (
      <div className="dictMojidict-Head">
        <div className="dictMojidict-Head_Main">
          <h1>{props.result.word.spell}</h1>
          <span className="dictMojidict-Pron">
            {props.result.word.pron}
          </span>{' '}
          <Speaker
            src={
              props.result.word.tts ||
              (() =>
                message.send<
                  'DICT_ENGINE_METHOD',
                  PromiseType<ReturnType<GetTTS>>
                >({
                  type: 'DICT_ENGINE_METHOD',
                  payload: {
                    id: 'mojidict',
                    method: 'getTTS',
                    args: [props.result.word?.tarId, 102]
                  }
                }))
            }
          />
          {props.result.word.excerpt && (
            <p className="dictMojidict-Excerpt">{props.result.word.excerpt}</p>
          )}
        </div>
        {props.result.word.imgUrl && (
          <img
            className="dictMojidict-Word_Image"
            src={props.result.word.imgUrl}
            alt={props.result.word.spell}
          />
        )}
      </div>
    )}

    {props.result.details &&
      props.result.details.map(detail => (
        <EntryBox key={detail.objectId} title={detail.title}>
          {detail.subdetails && (
            <ol className="dictMojidict-List">
              {detail.subdetails.map(subdetail => (
                <li key={subdetail.objectId} className="dictMojidict-ListItem">
                  <p className="dictMojidict-Word_Title">{subdetail.title}</p>
                  {subdetail.titleJa && (
                    <p className="dictMojidict-Word_Ja">{subdetail.titleJa}</p>
                  )}
                  {subdetail.examples && subdetail.examples.length > 0 && (
                    <ul className="dictMojidict-Sublist">
                      {subdetail.examples.map(example => (
                        <li key={example.objectId}>
                          <p className="dictMojidict-Word_Title">
                            <Notation html={example.notationTitle}>
                              {example.title}
                            </Notation>
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
                          {example.trans && (
                            <p className="dictMojidict-Word_Trans">
                              {example.trans}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </EntryBox>
      ))}

    {props.result.examples && props.result.examples.length > 0 && (
      <EntryBox title="例句">
        <ul className="dictMojidict-List dictMojidict-Plain_List">
          {props.result.examples.map(example => (
            <li key={example.objectId}>
              <p className="dictMojidict-Word_Title">
                <Notation html={example.notationTitle}>
                  {example.title}
                </Notation>
              </p>
              {example.trans && (
                <p className="dictMojidict-Word_Trans">{example.trans}</p>
              )}
              {example.source && (
                <p className="dictMojidict-Source">{example.source}</p>
              )}
            </li>
          ))}
        </ul>
      </EntryBox>
    )}

    {props.result.examQuestions && props.result.examQuestions.length > 0 && (
      <EntryBox title="真题">
        <ul className="dictMojidict-List dictMojidict-Plain_List">
          {props.result.examQuestions.map(question => (
            <li key={question.objectId}>
              <p className="dictMojidict-Word_Title">{question.title}</p>
              <p className="dictMojidict-Word_Trans">{question.excerpt}</p>
            </li>
          ))}
        </ul>
      </EntryBox>
    )}

    {props.result.related &&
      props.result.related.map(group => (
        <EntryBox key={group.title} title={group.title}>
          <ul className="dictMojidict-Related_List">
            {group.words.map(word => (
              <li key={word.objectId || word.title}>
                <SearchTag
                  className="dictMojidict-Related_Title"
                  text={word.title}
                  searchText={props.searchText}
                />
                {word.excerpt && (
                  <SearchTag
                    className="dictMojidict-Related_Excerpt"
                    text={word.excerpt}
                    searchText={props.searchText}
                  />
                )}
              </li>
            ))}
          </ul>
        </EntryBox>
      ))}
  </>
)

const Notation: FC<{ html?: string }> = ({ html, children }) =>
  html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : <>{children}</>

const SearchTag: FC<{
  className: string
  text: string
  searchText: ViewPorps<MojidictResult>['searchText']
}> = ({ className, text, searchText }) => (
  <button
    type="button"
    className={`dictMojidict-Search_Tag ${className}`}
    onClick={() =>
      searchText({
        word: newWord({
          text
        })
      })
    }
  >
    {text}
  </button>
)

export default DictMojidict
