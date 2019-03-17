import React from 'react'
import { WikipediaResult, WikipediaPayload, LangList } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { message } from '@/_helpers/browser-api'
import { MsgType, MsgDictEngineMethod } from '@/typings/message'

interface WikipediaState {
  cloneProps: ViewPorps<WikipediaResult> | null
  langList: null | LangList
}

export default class DictWikipedia extends React.PureComponent<ViewPorps<WikipediaResult>, WikipediaState> {
  state: WikipediaState = {
    cloneProps: null,
    langList: null,
  }

  static getDerivedStateFromProps (props: ViewPorps<WikipediaResult>, state: WikipediaState) {
    if (props !== state.cloneProps) {
      return {
        cloneProps: props,
        langList: null,
      }
    }
    return {
      cloneProps: props,
    }
  }

  handleEntryClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.target['classList']) {
      return
    }

    let $header = e.target as HTMLElement
    if (!$header.classList.contains('section-heading')) {
      $header = $header.parentElement as HTMLElement
      if (!$header || !$header.classList.contains('section-heading')) {
        return
      }
    }

    e.stopPropagation()
    e.preventDefault()

    // Toggle titles

    $header.classList.toggle('open-block')

    const $content = $header.nextElementSibling
    if ($content) {
      const pressed = $header.classList.contains('open-block').toString()
      $content.classList.toggle('open-block')
      $content.setAttribute('aria-pressed', pressed)
      $content.setAttribute('aria-expanded', pressed)
    }

    const $arrow = $header.querySelector('.mw-ui-icon-mf-arrow')
    if ($arrow) {
      $arrow.classList.toggle('mf-mw-ui-icon-rotate-flip')
    }

    this.props.recalcBodyHeight()
  }

  handleSelectChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      const payload: WikipediaPayload = {
        url: e.target.value
      }
      this.props.searchText({ id: 'wikipedia', payload })
    }
  }

  handleLangSelectorClick = async () => {
    this.setState({
      langList: await message.send<MsgDictEngineMethod>({
        type: MsgType.DictEngineMethod,
        id: 'wikipedia',
        method: 'fetchLangList',
        args: [this.props.result.langSelector],
      })
    })
  }

  renderLangSelector () {
    if (this.state.langList) {
      return (
        <select
          style={{ width: '100%' }}
          onChange={this.handleSelectChanged}
        >
          <option key='' value='' selected>{this.props.t('chooseLang')}</option>
          {this.state.langList.map(item => (
            <option key={item.url} value={item.url}>{item.title}</option>
          ))}
        </select>
      )
    }

    if (this.props.result.langSelector) {
      return (
        <button className='dictWikipedia-LangSelector' onClick={this.handleLangSelectorClick}>{
          this.props.t('fetchLangList')
        }</button>
      )
    }
  }

  render () {
    return (
      <>
        <h1 className='dictWikipedia-Title'>{this.props.result.title}</h1>
        {this.renderLangSelector()}
        <div className='dictWikipedia-Content' onClick={this.handleEntryClick}>
          <div className='client-js' dangerouslySetInnerHTML={{ __html: this.props.result.content }} />
        </div>
      </>
    )
  }
}
