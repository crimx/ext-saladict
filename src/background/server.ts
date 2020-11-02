import { message, openUrl } from '@/_helpers/browser-api'
import { timeout, timer } from '@/_helpers/promise-more'
import { getSuggests } from '@/_helpers/getSuggests'
import { injectDictPanel } from '@/_helpers/injectSaladictInternal'
import { newWord, Word } from '@/_helpers/record-manager'
import { Message, MessageResponse } from '@/typings/message'
import {
  SearchFunction,
  DictSearchResult,
  GetSrcPageFunction
} from '@/components/dictionaries/helpers'
import {
  isInNotebook,
  saveWord,
  deleteWords,
  getWordsByText,
  getWords
} from './database'
import { AudioManager } from './audio-manager'
import { QsPanelManager } from './windows-manager'
import { getTextFromClipboard, copyTextToClipboard } from './clipboard-manager'
import './types'
import { DictID } from '@/app-config'

/**
 * background script as transfer station
 */
export class BackgroundServer {
  private static instance: BackgroundServer

  static getInstance() {
    return (
      BackgroundServer.instance ||
      (BackgroundServer.instance = new BackgroundServer())
    )
  }

  static init = BackgroundServer.getInstance

  static getDictEngine<P = {}>(
    id: DictID
  ): Promise<{
    search: SearchFunction<DictSearchResult<any>, P>
    getSrcPage: GetSrcPageFunction
  }> {
    return import(
      /* webpackInclude: /engine\.ts$/ */
      /* webpackMode: "lazy" */
      `@/components/dictionaries/${id}/engine.ts`
    )
  }

  private qsPanelManager: QsPanelManager

  // singleton
  private constructor() {
    this.qsPanelManager = new QsPanelManager()

    message.addListener((msg, sender: browser.runtime.MessageSender) => {
      switch (msg.type) {
        case 'OPEN_DICT_SRC_PAGE':
          return this.openSrcPage(msg.payload)
        case 'OPEN_URL':
          return openUrl(msg.payload)
        case 'PLAY_AUDIO':
          return AudioManager.getInstance().play(msg.payload)
        case 'STOP_AUDIO':
          AudioManager.getInstance().reset()
          return
        case 'FETCH_DICT_RESULT':
          return this.fetchDictResult(msg.payload)
        case 'DICT_ENGINE_METHOD':
          return this.callDictEngineMethod(msg.payload)
        case 'GET_CLIPBOARD':
          return getTextFromClipboard()
        case 'SET_CLIPBOARD':
          return Promise.resolve(copyTextToClipboard(msg.payload))

        case 'INJECT_DICTPANEL':
          return injectDictPanel(sender.tab)

        case 'QUERY_QS_PANEL':
          return this.qsPanelManager.hasCreated()
        case 'OPEN_QS_PANEL':
          return this.openQSPanel()
        case 'CLOSE_QS_PANEL':
          AudioManager.getInstance().reset()
          return this.qsPanelManager.destroy()
        case 'QS_SWITCH_SIDEBAR':
          return this.qsPanelManager.toggleSidebar(msg.payload)

        case 'IS_IN_NOTEBOOK':
          return isInNotebook(msg.payload)
        case 'SAVE_WORD':
          return saveWord(msg.payload).then(response => {
            this.notifyWordSaved()
            return response
          })
        case 'DELETE_WORDS':
          return deleteWords(msg.payload).then(response => {
            this.notifyWordSaved()
            return response
          })
        case 'GET_WORDS_BY_TEXT':
          return getWordsByText(msg.payload)
        case 'GET_WORDS':
          return getWords(msg.payload)
        case 'GET_SUGGESTS':
          return getSuggests(msg.payload)
        case 'YOUDAO_TRANSLATE_AJAX':
          return this.youdaoTranslateAjax(msg.payload)
      }
    })

    browser.runtime.onConnect.addListener(port => {
      if (port.name === 'popup') {
        // This is a workaround for browser action page
        // which does not fire beforeunload event
        port.onDisconnect.addListener(() => {
          AudioManager.getInstance().reset()
        })
      }
    })
  }

  async openQSPanel(): Promise<void> {
    if (await this.qsPanelManager.hasCreated()) {
      await this.qsPanelManager.focus()
      return
    }
    await this.qsPanelManager.create()
  }

  async searchClipboard(): Promise<void> {
    const word = newWord({ text: await getTextFromClipboard() })

    if (await this.qsPanelManager.hasCreated()) {
      await message.send({
        type: 'QS_PANEL_SEARCH_TEXT',
        payload: word
      })
      return
    }

    await this.qsPanelManager.create(word)
  }

  async searchPageSelection(): Promise<void> {
    const tabs = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    })

    let word: Word | undefined

    if (tabs.length > 0 && tabs[0].id != null) {
      word = await message.send<'PRELOAD_SELECTION'>(tabs[0].id, {
        type: 'PRELOAD_SELECTION'
      })
    }

    const hasCreated = await this.qsPanelManager.hasCreated()

    if (hasCreated) {
      await this.qsPanelManager.focus()
    } else {
      await this.qsPanelManager.create(word)
    }
  }

  async openSrcPage({
    id,
    text,
    active
  }: Message<'OPEN_DICT_SRC_PAGE'>['payload']): Promise<void> {
    const engine = await BackgroundServer.getDictEngine(id)
    return openUrl({
      url: await engine.getSrcPage(
        text,
        window.appConfig,
        window.activeProfile
      ),
      active
    })
  }

  async fetchDictResult(
    data: Message<'FETCH_DICT_RESULT'>['payload']
  ): Promise<MessageResponse<'FETCH_DICT_RESULT'>> {
    const payload = data.payload || {}

    let response: DictSearchResult<any> | undefined

    try {
      const { search } = await BackgroundServer.getDictEngine<
        NonNullable<typeof data['payload']>
      >(data.id)

      try {
        response = await timeout(
          search(data.text, window.appConfig, window.activeProfile, payload),
          25000
        )
      } catch (e) {
        if (e.message === 'NETWORK_ERROR') {
          // retry once
          await timer(500)
          response = await timeout(
            search(data.text, window.appConfig, window.activeProfile, payload),
            25000
          )
        } else {
          throw e
        }
      }
    } catch (e) {
      if (process.env.DEBUG) {
        console.warn(data.id, e)
      }
    }

    const result = response
      ? { ...response, id: data.id }
      : { result: null, id: data.id }

    if (process.env.DEBUG) {
      console.log(`Search Engine ${data.id}`, data.text, result)
    }

    return result
  }

  async callDictEngineMethod(data: Message<'DICT_ENGINE_METHOD'>['payload']) {
    const engine = await BackgroundServer.getDictEngine(data.id)
    return engine[data.method](...(data.args || []))
  }

  notifyWordSaved() {
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(async tab => {
        if (tab.id && tab.url) {
          try {
            await message.send(tab.id, { type: 'WORD_SAVED' })
          } catch (e) {
            console.warn(e)
          }
        }
      })
    })
  }

  /** Bypass http restriction */
  youdaoTranslateAjax(request: any): Promise<any> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const data = xhr.status === 200 ? xhr.responseText : null
          resolve({
            response: data,
            index: request.index
          })
        }
      }
      xhr.open(request.type, request.url, true)

      if (request.type === 'POST') {
        xhr.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded'
        )
        xhr.send(request.data)
      } else {
        xhr.send(null as any)
      }
    })
  }
}
