import React, { FC, useState, useEffect } from 'react'
import {
  Word,
  getWordsByText,
  deleteWords,
  saveWord
} from '@/_helpers/record-manager'
import { AppConfig } from '@/app-config'
import { translateCtx } from '@/_helpers/translateCtx'
import { useTranslate } from '@/_helpers/i18n'
import WordCards from './WordCards'
import { message } from '@/_helpers/browser-api'

export interface WordEditorPanelProps {
  word: Word
  /** dicts to translate context */
  ctxTrans: AppConfig['ctxTrans']

  onWordChanged: (newWord: Word) => void
  onClose: () => void
}

export const WordEditorPanel: FC<WordEditorPanelProps> = props => {
  const { t } = useTranslate(['common', 'content'])
  const [isDirty, setDirty] = useState(false)
  const [relatedWords, setRelatedWords] = useState<Word[]>([])

  useEffect(getRelatedWords, [props.word.text])

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
            value={props.word.text}
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
            value={props.word.trans}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_Note">{t('note.note')}</label>
          <textarea
            rows={5}
            name="note"
            id="wordEditor-Note_Note"
            value={props.word.note}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_Context">{t('note.context')}</label>
          <textarea
            rows={5}
            name="context"
            id="wordEditor-Note_Context"
            value={props.word.context}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_SrcTitle">{t('note.srcTitle')}</label>
          <input
            type="text"
            name="title"
            id="wordEditor-Note_SrcTitle"
            value={props.word.title}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_SrcLink">{t('note.srcLink')}</label>
          <input
            type="text"
            name="url"
            id="wordEditor-Note_SrcLink"
            value={props.word.url}
            onChange={formChanged}
          />
          <label htmlFor="wordEditor-Note_SrcFavicon">
            {t('note.srcFavicon')}
            {props.word.favicon ? (
              <img
                className="wordEditor-Note_SrcFavicon"
                src={props.word.favicon}
                alt={t('note.srcTitle')}
              />
            ) : null}
          </label>
          <input
            type="text"
            name="favicon"
            id="wordEditor-Note_SrcFavicon"
            value={props.word.favicon}
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
          onClick={() => {
            translateCtx(props.word.context || props.word.text, props.ctxTrans)
              .then(trans => {
                props.onWordChanged({
                  ...props.word,
                  trans: props.word.trans
                    ? props.word.trans + '\n\n' + trans
                    : trans
                })
              })
              .catch(console.error)
          }}
        >
          {t('content:transContext')}
        </button>
        {!window.__SALADICT_INTERNAL_PAGE__ && (
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
            saveWord('notebook', props.word)
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

    props.onWordChanged({
      ...props.word,
      [currentTarget.name]: currentTarget.value
    })
  }

  function getRelatedWords() {
    if (!props.word.text) {
      setRelatedWords([])
    }
    getWordsByText('notebook', props.word.text)
      .then(words => {
        setRelatedWords(words.filter(({ date }) => date !== props.word.date))
      })
      .catch(() => {})
  }
}

export default WordEditorPanel
