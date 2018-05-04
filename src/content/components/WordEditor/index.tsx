import React, { ButtonHTMLAttributes } from 'react'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { SelectionInfo } from '@/_helpers/selection'
import { Word } from '@/background/database'
import WordCards from '../WordCards'

export interface WordEditorDispatchers {
  saveToNotebook: (info: SelectionInfo) => Promise<void>
  getWordsByText: (text: string) => Promise<Word[]>
  closeDictPanel: () => any
  closeModal: () => any
}

export interface WordEditorProps extends WordEditorDispatchers {
  dictPanelWidth: number
  info: SelectionInfo
}

interface WordEditorState {
  info: SelectionInfo
  relatedWords: Word[]
  width: number
  leftOffset: number
}

export class WordEditor extends React.PureComponent<WordEditorProps & { t: TranslationFunction }, WordEditorState> {
  constructor (props: WordEditorProps & { t: TranslationFunction }) {
    super(props)

    const winWidth = window.innerWidth
    const width = Math.min(800, Math.max(600, winWidth - props.dictPanelWidth - 100))
    const preferredLeft = props.dictPanelWidth + 60
    const currentLeft = (winWidth - width) / 2
    let leftOffset = preferredLeft - currentLeft
    if (preferredLeft + width / 2 >= winWidth) {
      // not enough space, close dict panel and mvoe to the left
      leftOffset = 10 - currentLeft
      this.props.closeDictPanel()
    }

    this.state = {
      info: props.info,
      relatedWords: [],
      width,
      leftOffset,
    }
  }

  mapValueToState = ({ currentTarget }) => {
    this.setState({ info: { ...this.state.info, [currentTarget.name]: currentTarget.value } })
  }

  saveToNotebook = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    this.props.saveToNotebook(this.state.info)
  }

  closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    const originInfo = this.props.info
    const currentInfo = this.state.info
    const isChanged = Object.keys(currentInfo).some(k => originInfo[k] !== currentInfo[k])
    if (!isChanged || confirm(this.props.t('wordEditorCloseConfirm'))) {
      this.props.closeModal()
    }
  }

  getRelatedWords = () => {
    const text = this.state.info.text
    if (!text) { return }
    this.props.getWordsByText(text)
      .then(words => {
        if (words.length > 0) {
          this.setState({ relatedWords: words })
        }
      })
  }

  componentDidMount () {
    this.getRelatedWords()
  }

  render () {
    const {
      t,
      saveToNotebook,
      closeModal,
    } = this.props

    const {
      info,
      relatedWords,
      width,
      leftOffset,
    } = this.state

    return (
      <div className='wordEditor-Container' style={{ width, transform: `translateX(${leftOffset}px)` }}>
        <header className='wordEditor-Header'>
          <h1 className='wordEditor-Title'>{t('wordEditorTitle')}</h1>
          <button type='button'
            className='wordEditor-Note_BtnClose'
            onClick={this.closeModal}
          >×</button>
        </header>
        <div className='wordEditor-Main'>
          <form className='wordEditor-Note'>
            <label htmlFor='wordEditor-Note_Word'>{t('wordEditorNoteWord')}</label>
            <input type='text'
              name='text'
              id='wordEditor-Note_Word'
              value={info.text}
              onChange={this.mapValueToState}
            />
            <label htmlFor='wordEditor-Note_Trans'>{t('wordEditorNoteTrans')}</label>
            <textarea rows={5}
              name='trans'
              id='wordEditor-Note_Trans'
              value={info.trans}
              onChange={this.mapValueToState}
            />
            <label htmlFor='wordEditor-Note_Note'>{t('wordEditorNoteNote')}</label>
            <textarea rows={5}
              name='note'
              id='wordEditor-Note_Note'
              value={info.note}
              onChange={this.mapValueToState}
            />
            <label htmlFor='wordEditor-Note_Context'>{t('wordEditorNoteContext')}</label>
            <textarea rows={5}
              name='context'
              id='wordEditor-Note_Context'
              value={info.context}
              onChange={this.mapValueToState}
            />
            <label htmlFor='wordEditor-Note_SrcTitle'>{t('wordEditorNoteSrcTitle')}</label>
            <input type='text'
              name='title'
              id='wordEditor-Note_SrcTitle'
              value={info.title}
              onChange={this.mapValueToState}
            />
            <label htmlFor='wordEditor-Note_SrcLink'>{t('wordEditorNoteSrcLink')}</label>
            <input type='text'
              name='url'
              id='wordEditor-Note_SrcLink'
              value={info.url}
              onChange={this.mapValueToState}
            />
            <label htmlFor='wordEditor-Note_SrcFavicon'>
              {t('wordEditorNoteSrcFavicon')}
              {info.favicon
                ? <img
                    className='wordEditor-Note_SrcFavicon'
                    src={info.favicon}
                    alt={t('wordEditorNoteSrcTitle')}
                  />
                : null}
            </label>
            <input type='text'
              name='favicon'
              id='wordEditor-Note_SrcFavicon'
              value={info.favicon}
              onChange={this.mapValueToState}
            />
          </form>
          {relatedWords.length > 0 && <WordCards words={relatedWords} /> }
        </div>
        <footer className='wordEditor-Footer'>
          <button type='button'
            className='wordEditor-Note_BtnCancel'
            onClick={this.closeModal}
          >{t('cancel')}</button>
          <button type='button'
            className='wordEditor-Note_BtnSave'
            onClick={this.saveToNotebook}
          >{t('save')}</button>
        </footer>
      </div>
    )
  }
}

export default translate()(WordEditor)
