import { message, openUrl } from '@/_helpers/browser-api'
import { timeout, timer } from '@/_helpers/promise-more'
import { getSuggests } from '@/_helpers/getSuggests'
import { injectDictPanel } from '@/_helpers/injectSaladictInternal'
import { newWord, Word } from '@/_helpers/record-manager'
import { Message, MessageResponse } from '@/typings/message'
import {
  SearchFunction,
  DictSearchResult,
  GetSrcPageFunction,
  createManualVerificationResult,
  isManualVerificationError
} from '@/components/dictionaries/helpers'
import {
  isInNotebook,
  saveWord,
  deleteWords,
  getWordsByText,
  getWords
} from './database'
import { QsPanelManager } from './windows-manager'
import './types'
import { DictID } from '@/app-config'
import { initBackgroundState } from './state'
import { getDomTaskBridge } from './dom-task-bridge'
import { canUseOffscreenDocument } from './offscreen-document'
import {
  callDictEngineMethodInOffscreen,
  getDictSrcPageInOffscreen,
  searchDictInOffscreen
} from './offscreen-dict-bridge'
import {
  consumePendingPdfOpenForViewer,
  openPdfViewerStandaloneIfNeeded
} from './pdf-sniffer'

const mv3BackgroundPreferredDicts = new Set<DictID>([
  'alibaba',
  'baidu',
  'caiyun',
  'google',
  'niutrans',
  'tencent',
  'volc',
  'youdaotrans'
])

function shouldUseOffscreenDictHost(id: DictID) {
  if (!canUseOffscreenDocument()) {
    return false
  }

  // MV3 offscreen documents only expose runtime APIs. OpenTranslate-based
  // machine translators need privileged network APIs such as
  // declarativeNetRequest in Chromium MV3. DOM-parsing dictionaries should use
  // offscreen; their network compatibility hooks run in background first.
  return !mv3BackgroundPreferredDicts.has(id)
}

async function ensureDictNetworkCompatibility(id: DictID) {
  try {
    const network = await import(
      /* webpackInclude: /network\.ts$/ */
      /* webpackMode: "eager" */
      `@/components/dictionaries/${id}/network.ts`
    )

    if (network && typeof network.ensureNetworkCompatibility === 'function') {
      await network.ensureNetworkCompatibility()
    }
  } catch (error) {
    // ignore failed import as most dictionaries do not have network compatibility
  }
}

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
      /* webpackMode: "eager" */
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
          return getDomTaskBridge().playAudio(msg.payload)
        case 'STOP_AUDIO':
          return getDomTaskBridge().stopAudio()
        case 'FETCH_DICT_RESULT':
          return this.fetchDictResult(msg.payload)
        case 'DICT_ENGINE_METHOD':
          return this.callDictEngineMethod(msg.payload)
        case 'GET_CLIPBOARD':
          return getDomTaskBridge().readClipboard()
        case 'SET_CLIPBOARD':
          return getDomTaskBridge().writeClipboard(msg.payload)

        case 'INJECT_DICTPANEL':
          return injectDictPanel(sender.tab)

        case 'QUERY_QS_PANEL':
          return this.qsPanelManager.hasCreated()
        case 'OPEN_QS_PANEL':
          return this.openQSPanel()
        case 'CLOSE_QS_PANEL':
          return getDomTaskBridge()
            .stopAudio()
            .then(() => this.qsPanelManager.destroy())
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
        case 'SYNC_SERVICE_DOWNLOAD':
          return import('./sync-manager').then(({ syncServiceDownload }) =>
            syncServiceDownload()
          )
        case 'GET_SUGGESTS':
          return getSuggests(msg.payload)
        case 'GET_PDF_SNIFF_PENDING':
          return consumePendingPdfOpenForViewer(sender, (msg as any).payload)
        case 'OPEN_PDF_VIEWER_STANDALONE_IF_NEEDED':
          return openPdfViewerStandaloneIfNeeded(
            msg.payload.url,
            sender,
            (msg as any).payload
          )
        case 'YOUDAO_TRANSLATE_AJAX':
          return this.youdaoTranslateAjax(msg.payload)
      }
    })

    browser.runtime.onConnect.addListener(port => {
      if (port.name === 'popup') {
        // This is a workaround for browser action page
        // which does not fire beforeunload event
        port.onDisconnect.addListener(() => {
          getDomTaskBridge().stopAudio()
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
    const word = newWord({ text: await getDomTaskBridge().readClipboard() })

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
    const { appConfig, activeProfile } = await initBackgroundState()
    const useOffscreenHost = shouldUseOffscreenDictHost(id)

    if (process.env.DEBUG) {
      console.log(
        `[dict-host] OPEN_DICT_SRC_PAGE ${id} -> ${
          useOffscreenHost ? 'offscreen' : 'background'
        }`
      )
    }

    const url = useOffscreenHost
      ? await getDictSrcPageInOffscreen(
          { id, text, active },
          appConfig,
          activeProfile
        )
      : await BackgroundServer.getDictEngine(id).then(engine =>
          engine.getSrcPage(text, appConfig, activeProfile)
        )

    return openUrl({
      url,
      active
    })
  }

  async fetchDictResult(
    data: Message<'FETCH_DICT_RESULT'>['payload']
  ): Promise<MessageResponse<'FETCH_DICT_RESULT'>> {
    const payload = data.payload || {}
    const { appConfig, activeProfile } = await initBackgroundState()

    let response: DictSearchResult<any> | undefined

    try {
      await ensureDictNetworkCompatibility(data.id)

      const useOffscreenHost = shouldUseOffscreenDictHost(data.id)

      if (process.env.DEBUG) {
        console.log(
          `[dict-host] FETCH_DICT_RESULT ${data.id} -> ${
            useOffscreenHost ? 'offscreen' : 'background'
          }`
        )
      }

      const runSearch = useOffscreenHost
        ? () => searchDictInOffscreen(data, appConfig, activeProfile)
        : async () => {
            const { search } = await BackgroundServer.getDictEngine<
              NonNullable<typeof data['payload']>
            >(data.id)

            return search(data.text, appConfig, activeProfile, payload)
          }

      try {
        response = await timeout(runSearch(), 25000)
      } catch (e) {
        if (e.message === 'NETWORK_ERROR') {
          // retry once
          await timer(500)
          response = await timeout(runSearch(), 25000)
        } else {
          throw e
        }
      }
    } catch (e) {
      if (isManualVerificationError(e)) {
        response = createManualVerificationResult(e.manualVerification)
      }
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
    const useOffscreenHost = shouldUseOffscreenDictHost(data.id)

    if (process.env.DEBUG) {
      console.log(
        `[dict-host] DICT_ENGINE_METHOD ${data.id}.${data.method} -> ${
          useOffscreenHost ? 'offscreen' : 'background'
        }`
      )
    }

    if (useOffscreenHost) {
      return callDictEngineMethodInOffscreen(data)
    }

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
  async youdaoTranslateAjax(request: any): Promise<any> {
    try {
      const response = await fetch(request.url, {
        method: request.type,
        headers:
          request.type === 'POST'
            ? {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            : undefined,
        body: request.type === 'POST' ? request.data : undefined
      })

      return {
        response: response.ok ? await response.text() : null,
        index: request.index
      }
    } catch (error) {
      return {
        response: null,
        index: request.index
      }
    }
  }
}
