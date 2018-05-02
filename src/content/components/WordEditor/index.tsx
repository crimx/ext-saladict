import React, { ButtonHTMLAttributes } from 'react'
import { translate } from 'react-i18next'
import { TranslationFunction } from 'i18next'
import { SelectionInfo } from '@/_helpers/selection'
import { Word } from '@/background/database'

export interface WordEditorDispatchers {
  saveToNotebook: (info: SelectionInfo) => void
  getWordsByText: (text: string) => Promise<Word[]>
  closeModal: () => void
}

export interface WordEditorProps extends WordEditorDispatchers {
  info: SelectionInfo
}

interface WordEditorState {
  words: Array<SelectionInfo & { readonly date?: number }>
  untaintedWords: Array<SelectionInfo & { readonly date?: number }>
  index: number
  isFoundOnNotebook: boolean
}

export class WordEditor extends React.PureComponent<WordEditorProps & { t: TranslationFunction }, WordEditorState> {
  constructor (props: WordEditorProps & { t: TranslationFunction }) {
    super(props)
    this.state = {
      words: [props.info],
      untaintedWords: [props.info],
      index: 0,
      isFoundOnNotebook: false
    }
  }

  mapValueToState = ({ currentTarget }) => {
    const name = currentTarget.name
    const newWOrds = [...this.state.words]
    const i = this.state.index
    newWOrds[i] = { ...newWOrds[i], [name]: currentTarget.value }
    this.setState({ words: newWOrds })
  }

  saveToNotebook = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    this.state.words.forEach(this.props.saveToNotebook)
  }

  closeModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    this.props.closeModal()
  }

  getRelatedWords = () => {
    const curWord = this.state.words[this.state.index]
    this.props.getWordsByText(curWord.text)
      .then(words => {
        const i = words.findIndex(word =>
          word.text === curWord.text && word.context === curWord.context
        )
        if (i >= 0) {
          /** @todo */
        }
        this.setState({
          isFoundOnNotebook: i >= 0,
        })
      })
  }

  render () {
    const {
      t,
      saveToNotebook,
      closeModal,
    } = this.props

    const info = this.state.words[this.state.index]

    return (
      <div className='wordEditor-Container'>
        <header className='wordEditor-Header'>
          <h1 className='wordEditor-Title'>{t('wordEditorTitle')}</h1>
          <button type='button'
            className='wordEditor-Note_BtnClose'
            onClick={this.closeModal}
          >×</button>
        </header>
        <div className='wordEditor-Main'>
          <aside className='wordEditor-DictPanel'>

          </aside>
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
          {this.state.words.length > 1 &&
            <aside className='wordEditor-WordCards'>

            </aside>
          }
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
