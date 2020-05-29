import React, { FC, useState, useEffect } from 'react'
import { useUpdateEffect } from 'react-use'
import {
  useObservable,
  useObservableState,
  useObservableCallback,
  useSubscription,
  pluckFirst
} from 'observable-hooks'
import { of } from 'rxjs'
import {
  withLatestFrom,
  switchMap,
  debounceTime,
  startWith
} from 'rxjs/operators'

import {
  Word,
  getWordsByText,
  deleteWords,
  saveWord
} from '@/_helpers/record-manager'
import { AppConfig } from '@/app-config'
import {
  translateCtxs,
  genCtxText,
  CtxTranslateResults
} from '@/_helpers/translateCtx'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
import { isOptionsPage } from '@/_helpers/saladict'

import { WordCards } from './WordCards'
import { WordEditorPanel, WordEditorPanelProps } from './WordEditorPanel'
import { CSSTransition } from 'react-transition-group'
import { CtxTransList } from './CtxTransList'

export interface NotesProps
  extends Pick<WordEditorPanelProps, 'containerWidth'> {
  wordEditor: {
    word: Word
    translateCtx: boolean
  }
  /** dicts to translate context */
  ctxTrans: AppConfig['ctxTrans']

  onClose: () => void
}

const notesFadeTimeout = { enter: 400, exit: 100, appear: 400 }

export const Notes: FC<NotesProps> = props => {
  const { t } = useTranslate(['common', 'content'])
  const [isDirty, setDirty] = useState(false)
  const [isShowCtxTransList, setShowCtxTransList] = useState(false)

  const [word, setWord] = useState(props.wordEditor.word)
  const word$ = useObservable(pluckFirst, [word])

  const [ctxTransConfig, setCtxTransConfig] = useState(props.ctxTrans)
  useUpdateEffect(() => {
    setCtxTransConfig(props.ctxTrans)
  }, [props.ctxTrans])

  const [ctxTransResult, setCtxTransResult] = useState(() =>
    Object.keys(props.ctxTrans).reduce((result, id) => {
      result[id] = ''
      return result
    }, {} as CtxTranslateResults)
  )

  const [getRelatedWords, relatedWords$] = useObservableCallback<
    Word[],
    never,
    []
  >(event$ =>
    event$.pipe(
      debounceTime(200),
      withLatestFrom(word$),
      switchMap(([, word]) => {
        if (!word.text) {
          return of([])
        }

        return getWordsByText('notebook', word.text)
          .then(words => words.filter(({ date }) => date !== word.date))
          .catch(() => [])
      }),
      startWith([])
    )
  )

  const relatedWords = useObservableState(relatedWords$)!

  const [onTranslateCtx, translateCtx$] = useObservableCallback<
    CtxTranslateResults,
    typeof ctxTransConfig
  >(event$ =>
    event$.pipe(
      withLatestFrom(word$),
      switchMap(([ctxTransConfig, word]) => {
        return translateCtxs(word.context || word.text, ctxTransConfig)
      })
    )
  )
  useSubscription(translateCtx$, setCtxTransResult)

  useEffect(() => {
    if (props.wordEditor.translateCtx) {
      onTranslateCtx(ctxTransConfig)
    }
  }, [])

  useEffect(getRelatedWords, [word.text, word.context])

  useUpdateEffect(() => {
    setWord({
      ...word,
      trans: genCtxText(word.trans, ctxTransResult)
    })
  }, [ctxTransResult])

  const closeEditor = () => {
    if (!isDirty || confirm(t('content:wordEditor.closeConfirm'))) {
      props.onClose()
    }
  }

  const formChanged = ({
    currentTarget
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDirty(true)
    setWord({
      ...word,
      [currentTarget.name]: currentTarget.value
    })
  }

  const panelBtns = [
    {
      type: 'normal',
      title: t('content:transContext'),
      onClick: () => onTranslateCtx(ctxTransConfig)
    },
    {
      type: 'normal',
      title: t('content:neverShow'),
      onClick: () => {
        if (!isOptionsPage()) {
          message.send({
            type: 'OPEN_URL',
            payload: {
              url: 'options.html?menuselected=Notebook',
              self: true
            }
          })
        }
      }
    },
    {
      type: 'normal',
      title: t('cancel'),
      onClick: closeEditor
    },
    {
      type: 'primary',
      title: t('save'),
      onClick: () => {
        saveWord('notebook', word)
          .then(props.onClose)
          .catch(console.error)
      }
    }
  ] as const

  return (
    <>
      <WordEditorPanel
        containerWidth={props.containerWidth}
        title={t('content:wordEditor.title')}
        btns={panelBtns}
        onClose={closeEditor}
      >
        <div className="wordEditorNote-Container">
          <div className="wordEditorNote">
            <label htmlFor="wordEditorNote_Word">{t('note.word')}</label>
            <input
              type="text"
              name="text"
              id="wordEditorNote_Word"
              value={word.text}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
            <label htmlFor="wordEditorNote_Context">{t('note.context')}</label>
            <textarea
              rows={3}
              name="context"
              id="wordEditorNote_Context"
              value={word.context}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
            <div className="wordEditorNote_LabelWithBtn">
              <label htmlFor="wordEditorNote_Trans">
                {t('note.trans')}
                <a
                  href="https://saladict.crimx.com/q&a.html#%E9%97%AE%EF%BC%9A%E6%B7%BB%E5%8A%A0%E7%94%9F%E8%AF%8D%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E5%8A%A0%E5%85%A5%E5%8D%95%E8%AF%8D%E7%BF%BB%E8%AF%91%EF%BC%88%E8%80%8C%E4%B8%8D%E6%98%AF%E7%BF%BB%E8%AF%91%E6%95%B4%E5%8F%A5%E4%B8%8A%E4%B8%8B%E6%96%87%EF%BC%89%E3%80%82"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  {' '}
                  Why?
                </a>
              </label>
              <button onClick={() => setShowCtxTransList(true)}>
                {t('content:wordEditor.chooseCtxTitle')}
              </button>
            </div>
            <textarea
              rows={10}
              name="trans"
              id="wordEditorNote_Trans"
              value={word.trans}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
            <p className="wordEditorNote_Help">
              {t('content:wordEditor.ctxHelp')}
            </p>
            <label htmlFor="wordEditorNote_Note">{t('note.note')}</label>
            <textarea
              rows={5}
              name="note"
              id="wordEditorNote_Note"
              value={word.note}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
            <label htmlFor="wordEditorNote_SrcTitle">
              {t('note.srcTitle')}
            </label>
            <input
              type="text"
              name="title"
              id="wordEditorNote_SrcTitle"
              value={word.title}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
            <label htmlFor="wordEditorNote_SrcLink">{t('note.srcLink')}</label>
            <input
              type="text"
              name="url"
              id="wordEditorNote_SrcLink"
              value={word.url}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
            <label htmlFor="wordEditorNote_SrcFavicon">
              {t('note.srcFavicon')}
              {word.favicon ? (
                <img
                  className="wordEditorNote_SrcFavicon"
                  src={word.favicon}
                  alt={t('note.srcTitle')}
                />
              ) : null}
            </label>
            <input
              type="text"
              name="favicon"
              id="wordEditorNote_SrcFavicon"
              value={word.favicon}
              onChange={formChanged}
              onKeyDown={stopPropagation}
            />
          </div>
          {relatedWords.length > 0 && (
            <WordCards
              words={relatedWords}
              onCardDelete={word => {
                if (window.confirm(t('content:wordEditor.deleteConfirm'))) {
                  deleteWords('notebook', [word.date]).then(getRelatedWords)
                }
              }}
            />
          )}
        </div>
      </WordEditorPanel>

      <CSSTransition
        classNames="notes-fade"
        mountOnEnter
        unmountOnExit
        timeout={notesFadeTimeout}
        in={isShowCtxTransList}
      >
        {() => (
          <WordEditorPanel
            containerWidth={props.containerWidth - 100}
            title={t('content:wordEditor.chooseCtxTitle')}
            onClose={() => setShowCtxTransList(false)}
            btns={[
              {
                type: 'normal',
                title: t('content:transContext'),
                onClick: () => onTranslateCtx(ctxTransConfig)
              }
            ]}
          >
            <CtxTransList
              word={word}
              ctxTransConfig={ctxTransConfig}
              ctxTransResult={ctxTransResult}
              onNewCtxTransConfig={(id, enabled) => {
                setCtxTransConfig(ctxTransConfig => ({
                  ...ctxTransConfig,
                  [id]: enabled
                }))
              }}
              onNewCtxTransResult={(id, content) => {
                setCtxTransResult(ctxTransResult => ({
                  ...ctxTransResult,
                  [id]: content
                }))
              }}
            />
          </WordEditorPanel>
        )}
      </CSSTransition>
    </>
  )
}

function stopPropagation(e: React.KeyboardEvent<HTMLElement>) {
  e.stopPropagation()
  e.nativeEvent.stopPropagation()
}
