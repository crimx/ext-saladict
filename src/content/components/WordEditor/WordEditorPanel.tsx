import React, { FC, useState } from 'react'
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
  saveWord,
  newWord
} from '@/_helpers/record-manager'
import { AppConfig } from '@/app-config'
import { translateCtx } from '@/_helpers/translateCtx'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
import { isInternalPage } from '@/_helpers/saladict'
import WordCards from './WordCards'

export interface WordEditorPanelProps {
  word: Word | null
  /** dicts to translate context */
  ctxTrans: AppConfig['ctxTrans']

  // onWordChanged: (newWord: Word) => void
  onClose: () => void
}

export const WordEditorPanel: FC<WordEditorPanelProps> = props => {
  const { t } = useTranslate(['common', 'content'])
  const [isDirty, setDirty] = useState(false)

  const [word, setWord] = useState(() => props.word || newWord())
  useUpdateEffect(() => {
    if (props.word) {
      setWord(props.word)
    }
  }, [props.word])

  const word$ = useObservable(pluckFirst, [word])

  const [relatedWords, getRelatedWords] = useObservableState<Word[], void>(
    event$ =>
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
        })
      ),
    []
  )

  const [onTranslateCtx, translateCtx$] = useObservableCallback<string, any>(
    event$ =>
      event$.pipe(
        startWith(null),
        withLatestFrom(word$),
        switchMap(([, word]) => {
          return translateCtx(word.context || word.text, props.ctxTrans)
        })
      )
  )

  useSubscription(translateCtx$, trans => {
    setWord({
      ...word,
      trans: word.trans ? word.trans + '\n\n' + trans : trans
    })
  })

  return (
    <div className="wordEditor-Panel">
      <header className="wordEditor-Header">
        <h1 className="wordEditor-Title">{t('content:wordEditor.title')}</h1>
        <button
          type="button"
          className="wordEditor-Note_BtnClose"
          onClick={closeEditor}
        >
          ×
        </button>
      </header>
      <div className="wordEditor-Main">
        <form className="wordEditor-Note">
          <label htmlFor="wordEditor-Note_Word">{t('note.word')}</label>
          <input
            type="text"
            name="text"
            id="wordEditor-Note_Word"
            value={word.text}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_Trans">
            {t('note.trans')}
            <a
              href="https://github.com/crimx/ext-saladict/wiki/Q&A#%E9%97%AE%E6%B7%BB%E5%8A%A0%E7%94%9F%E8%AF%8D%E5%8F%AF%E4%B8%8D%E5%8F%AF%E4%BB%A5%E5%8A%A0%E5%85%A5%E5%8D%95%E8%AF%8D%E7%BF%BB%E8%AF%91%E8%80%8C%E4%B8%8D%E6%98%AF%E7%BF%BB%E8%AF%91%E6%95%B4%E5%8F%A5%E4%B8%8A%E4%B8%8B%E6%96%87"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              {' '}
              Why?
            </a>
          </label>
          <textarea
            rows={5}
            name="trans"
            id="wordEditor-Note_Trans"
            value={word.trans}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_Note">{t('note.note')}</label>
          <textarea
            rows={5}
            name="note"
            id="wordEditor-Note_Note"
            value={word.note}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_Context">{t('note.context')}</label>
          <textarea
            rows={5}
            name="context"
            id="wordEditor-Note_Context"
            value={word.context}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_SrcTitle">{t('note.srcTitle')}</label>
          <input
            type="text"
            name="title"
            id="wordEditor-Note_SrcTitle"
            value={word.title}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_SrcLink">{t('note.srcLink')}</label>
          <input
            type="text"
            name="url"
            id="wordEditor-Note_SrcLink"
            value={word.url}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_SrcFavicon">
            {t('note.srcFavicon')}
            {word.favicon ? (
              <img
                className="wordEditor-Note_SrcFavicon"
                src={word.favicon}
                alt={t('note.srcTitle')}
              />
            ) : null}
          </label>
          <input
            type="text"
            name="favicon"
            id="wordEditor-Note_SrcFavicon"
            value={word.favicon}
            onChange={formChanged}
          />
        </form>
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
      <footer className="wordEditor-Footer">
        <button
          type="button"
          className="wordEditor-Note_Btn"
          onClick={onTranslateCtx}
        >
          {t('content:transContext')}
        </button>
        {!isInternalPage() && (
          <button
            type="button"
            className="wordEditor-Note_Btn"
            onClick={() => {
              message.send({
                type: 'OPEN_URL',
                payload: {
                  url: 'options.html?menuselected=Notebook',
                  self: true
                }
              })
            }}
          >
            {t('content:neverShow')}
          </button>
        )}
        <button
          type="button"
          className="wordEditor-Note_Btn"
          onClick={closeEditor}
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          className="wordEditor-Note_BtnSave"
          onClick={() =>
            saveWord('notebook', word)
              .then(closeEditor)
              .catch(console.error)
          }
        >
          {t('save')}
        </button>
      </footer>
    </div>
  )

  function closeEditor() {
    if (!isDirty || confirm(t('content:wordEditor.closeConfirm'))) {
      props.onClose()
    }
  }

  function formChanged({
    currentTarget
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setDirty(true)

    setWord({
      ...word,
      [currentTarget.name]: currentTarget.value
    })
  }
}

export default WordEditorPanel
