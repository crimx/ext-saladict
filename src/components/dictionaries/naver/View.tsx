import React, { FC } from 'react'
import Speaker from '@/components/Speaker'
import { NaverResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictNaver: FC<ViewPorps<NaverResult>> = props => {
  const ListMap = props.result.entry

  return (
    <>
      <select
        onChange={e =>
          props.searchText({
            id: 'naver',
            payload: { lang: e.target.value }
          })
        }
        value={props.result.lang}
      >
        <option key="zh" value="zh">
          中韩
        </option>
        <option key="ja" value="ja">
          日韓
        </option>
      </select>

      {/* entry */}
      {!!ListMap?.WORD?.items?.length && (
        <div className={'dictNaver-EntryBox'}>
          <span className={'dictNaver-EntryBoxTitle'}>单词</span>

          {ListMap.WORD.items.map((word, wordI) => {
            return (
              <div className={'dictNaver-Entry'} key={wordI}>
                <h3
                  className={'dictNaver-EntryTitle'}
                  dangerouslySetInnerHTML={{ __html: word.expEntry }}
                />
                {word.expEntrySuperscript && (
                  <sup className={'dictNaver-EntrySup'}>
                    {word.expEntrySuperscript}
                  </sup>
                )}
                {word.expKanji && (
                  <>
                    [
                    <span
                      className={'dictNaver-EntryKanji'}
                      dangerouslySetInnerHTML={{ __html: word.expKanji }}
                    ></span>
                    ]
                  </>
                )}

                <div className={'dictNaver-EntryPron'}>
                  {!!word?.searchPhoneticSymbolList?.length && (
                    <>
                      {word.searchPhoneticSymbolList[0].phoneticSymbol && (
                        <span>
                          [{word.searchPhoneticSymbolList[0].phoneticSymbol}]
                        </span>
                      )}
                      {word?.searchPhoneticSymbolList[0]
                        ?.phoneticSymbolPath && (
                        <Speaker
                          src={
                            word.searchPhoneticSymbolList[0]?.phoneticSymbolPath?.split(
                              '|'
                            ).length > 1
                              ? word.searchPhoneticSymbolList[0]?.phoneticSymbolPath?.split(
                                  '|'
                                )[0]
                              : word.searchPhoneticSymbolList[0]
                                  .phoneticSymbolPath
                          }
                        />
                      )}
                    </>
                  )}

                  {word?.frequencyAdd?.split('^').map(wordF => (
                    <span key={wordF} className={'dictNaver-EntryPronFa'}>
                      {wordF}
                    </span>
                  ))}
                </div>

                <div className={'dictNaver-EntryExp'}>
                  {word?.meansCollector?.map((wordMc, wordMcI) => {
                    return (
                      <ul key={wordMcI}>
                        {wordMc.means.map((m, mI) => (
                          <li key={mI}>
                            {m.order && <span>{m.order}.</span>}
                            {wordMc.partOfSpeech2 && (
                              <span className={'dictNaver-EntryExpPos'}>
                                {wordMc.partOfSpeech2}
                              </span>
                            )}
                            {m.subjectGroup && <span>{m.subjectGroup}</span>}
                            <span
                              dangerouslySetInnerHTML={{ __html: m.value }}
                            ></span>
                          </li>
                        ))}
                      </ul>
                    )
                  })}
                </div>

                <a
                  className={'dictNaver-EntrySource'}
                  href={word.sourceDictnameLink}
                >
                  {word.sourceDictnameOri}
                </a>
              </div>
            )
          })}
        </div>
      )}

      {/* mean */}
      {!!ListMap?.MEANING?.items?.length && (
        <div className={'dictNaver-MeanBox'}>
          <span className={'dictNaver-MeanBoxTitle'}>释义</span>

          {ListMap.MEANING.items.map((meaning, meaningI) => {
            return (
              <div className={'dictNaver-Mean'} key={meaningI}>
                <h3
                  className={'dictNaver-MeanTitle'}
                  dangerouslySetInnerHTML={{ __html: meaning.expEntry }}
                />
                {meaning.expEntrySuperscript && (
                  <sup className={'dictNaver-MeanSup'}>
                    {meaning.expEntrySuperscript}
                  </sup>
                )}

                {!!meaning?.expAliasGeneralAlwaysList?.length && (
                  <span
                    className={'dictNaver-MeanAlias'}
                    dangerouslySetInnerHTML={{
                      __html:
                        meaning.expAliasGeneralAlwaysList[0].originLanguageValue
                    }}
                  ></span>
                )}

                <div className={'dictNaver-MeanPron'}>
                  {!!meaning?.searchPhoneticSymbolList?.length && (
                    <>
                      <span>
                        [{meaning.searchPhoneticSymbolList[0].phoneticSymbol}]
                      </span>
                      <Speaker
                        src={
                          meaning.searchPhoneticSymbolList[0].phoneticSymbolPath
                        }
                      />
                    </>
                  )}
                </div>

                <div className={'dictNaver-MeanExp'}>
                  {meaning?.meansCollector?.map((meaningMc, meaningMcI) => {
                    return (
                      <ul key={meaningMcI}>
                        {meaningMc?.means.map((m, mI) => (
                          <li key={mI}>
                            {m.order && <span>{m.order}.</span>}
                            {meaningMc.partOfSpeech2 && (
                              <span className={'dictNaver-MeanExpPos'}>
                                {meaningMc.partOfSpeech2}
                              </span>
                            )}
                            {m.subjectGroup && <span>{m.subjectGroup}</span>}
                            {m.languageGroup && (
                              <span className={'dictNaver-MeanExpLg'}>
                                {m.languageGroup}
                              </span>
                            )}
                            <span
                              dangerouslySetInnerHTML={{ __html: m.value }}
                            ></span>
                          </li>
                        ))}
                      </ul>
                    )
                  })}
                </div>

                <a
                  className={'dictNaver-MeanSource'}
                  href={meaning.sourceDictnameLink}
                >
                  {meaning.sourceDictnameOri}
                </a>
              </div>
            )
          })}
        </div>
      )}

      {/* example */}
      {!!ListMap?.EXAMPLE?.items?.length && (
        <div className={'dictNaver-ExampleBox'}>
          <span className={'dictNaver-ExampleBoxTitle'}>例句</span>

          {ListMap.EXAMPLE.items.map((example, exampleI) => {
            return (
              <div className={'dictNaver-Example'} key={exampleI}>
                <h3
                  className={'dictNaver-ExampleTitle'}
                  dangerouslySetInnerHTML={{ __html: example.expExample1 }}
                />

                <div className={'dictNaver-ExamplePron'}>
                  <Speaker
                    src={
                      props.result.lang === 'ja'
                        ? `https://ja.dict.naver.com/api/nvoice?speaker=yuri&service=dictionary&speech_fmt=mp3&text=${example.exampleEncode}`
                        : `https://zh.dict.naver.com/tts?service=zhkodict&from=pc&speaker=zh_cn&text=${example.exampleEncode}`
                    }
                  />
                </div>

                <div className={'dictNaver-ExamplePronun'}>
                  {example.expExample1Pronun}
                </div>

                <div
                  className={'dictNaver-ExampleExtra'}
                  dangerouslySetInnerHTML={{ __html: example.expExample2 }}
                ></div>

                <div>
                  <a
                    className={'dictNaver-ExampleSource'}
                    href={example.sourceDictnameURL}
                  >
                    {example.sourceDictnameOri}
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default DictNaver
