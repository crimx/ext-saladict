import { message, openURL } from '@/_helpers/browser-api'
import { timeout, timer } from '@/_helpers/promise-more'
import { getSuggests } from '@/_helpers/getSuggests'
import { injectDictPanel } from '@/_helpers/injectSaladictInternal'
import { newWord } from '@/_helpers/record-manager'
import { Message, MessageResponse } from '@/typings/message'
import {
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '@/components/dictionaries/helpers'
import {
  syncServiceInit,
  syncServiceDownload,
  syncServiceUpload
} from './sync-manager'
import {
  isInNotebook,
  saveWord,
  deleteWords,
  getWordsByText,
  getWords
} from './database'
import { play } from './audio-manager'
import './types'

/** is a standalone panel running */
let qsPanelID: number | false = false
/** last focused window before standalone panel showing */
let lastQsMainWindow: browser.windows.Window | undefined

message.self.initServer()

// background script as transfer station
message.addListener((msg, sender: browser.runtime.MessageSender) => {
  switch (msg.type) {
    case 'OPEN_DICT_SRC_PAGE':
      return openSrcPage(msg.payload)
    case 'OPEN_URL':
      return openURL(msg.payload.url, msg.payload.self)
    case 'PLAY_AUDIO':
      return play(msg.payload)
    case 'FETCH_DICT_RESULT':
      return fetchDictResult(msg.payload)
    case 'DICT_ENGINE_METHOD':
      return callDictEngineMethod(msg.payload)
    case 'GET_CLIPBOARD':
      return getClipboard()

    case 'INJECT_DICTPANEL':
      return injectDictPanel(sender.tab)

    case 'QUERY_QS_PANEL':
      return Promise.resolve(qsPanelID !== false)
    case 'OPEN_QS_PANEL':
      return openQSPanel()
    case 'CLOSE_QS_PANEL':
      return closeQSPanel()

    case 'IS_IN_NOTEBOOK':
      return isInNotebook(msg.payload)
    case 'SAVE_WORD':
      return saveWord(msg.payload).then(response => {
        setTimeout(() => message.send({ type: 'WORD_SAVED' }), 0)
        return response
      })
    case 'DELETE_WORDS':
      return deleteWords(msg.payload).then(response => {
        setTimeout(() => message.send({ type: 'WORD_SAVED' }), 0)
        return response
      })
    case 'GET_WORDS_BY_TEXT':
      return getWordsByText(msg.payload)
    case 'GET_WORDS':
      return getWords(msg.payload)
    case 'GET_SUGGESTS':
      return getSuggests(msg.payload)

    case 'SYNC_SERVICE_INIT':
      return syncServiceInit(msg.payload)
    case 'SYNC_SERVICE_DOWNLOAD':
      return syncServiceDownload(msg.payload)
    case 'SYNC_SERVICE_UPLOAD':
      return syncServiceUpload(msg.payload)

    case 'YOUDAO_TRANSLATE_AJAX':
      return youdaoTranslateAjax(msg.payload)
  }
})

browser.windows.onRemoved.addListener(async winID => {
  if (winID === qsPanelID) {
    qsPanelID = false
    ;(await browser.tabs.query({})).forEach(tab => {
      if (tab.id && tab.windowId !== winID) {
        message.send(tab.id, {
          type: 'QS_PANEL_CHANGED',
          payload: qsPanelID !== false
        })
      }
    })
  }
})

export async function openQSPanel(): Promise<void> {
  if (qsPanelID !== false) {
    await browser.windows.update(qsPanelID, { focused: true })
    const [tab] = await browser.tabs.query({ windowId: qsPanelID })
    if (tab && tab.id) {
      await message.send(tab.id, { type: 'QS_PANEL_FOCUSED' })
    }
    return
  }

  const {
    tripleCtrlLocation,
    panelWidth,
    tripleCtrlHeight,
    tripleCtrlSidebar
  } = window.appConfig
  let qsPanelLeft = 10
  let qsPanelTop = 30
  let qsPanelWidth = window.appConfig.panelWidth
  let qsPanelHeight = window.appConfig.tripleCtrlHeight

  if (tripleCtrlSidebar === 'left') {
    qsPanelLeft = 0
    qsPanelTop = 0
    qsPanelHeight = window.screen.availHeight
  } else if (tripleCtrlSidebar === 'right') {
    qsPanelLeft = window.screen.availWidth - qsPanelWidth
    qsPanelTop = 0
    qsPanelHeight = window.screen.availHeight
  } else {
    switch (tripleCtrlLocation) {
      case 'CENTER':
        qsPanelLeft = (screen.width - panelWidth) / 2
        qsPanelTop = (screen.height - tripleCtrlHeight) / 2
        break
      case 'TOP':
        qsPanelLeft = (screen.width - panelWidth) / 2
        qsPanelTop = 30
        break
      case 'RIGHT':
        qsPanelLeft = screen.width - panelWidth - 30
        qsPanelTop = (screen.height - tripleCtrlHeight) / 2
        break
      case 'BOTTOM':
        qsPanelLeft = (screen.width - panelWidth) / 2
        qsPanelTop = screen.height - 10
        break
      case 'LEFT':
        qsPanelLeft = 10
        qsPanelTop = (screen.height - tripleCtrlHeight) / 2
        break
      case 'TOP_LEFT':
        qsPanelLeft = 10
        qsPanelTop = 30
        break
      case 'TOP_RIGHT':
        qsPanelLeft = screen.width - panelWidth - 30
        qsPanelTop = 30
        break
      case 'BOTTOM_LEFT':
        qsPanelLeft = 10
        qsPanelTop = screen.height - 10
        break
      case 'BOTTOM_RIGHT':
        qsPanelLeft = screen.width - panelWidth - 30
        qsPanelTop = screen.height - 10
        break
    }
  }

  let url = browser.runtime.getURL(
    `quick-search.html?sidebar=${tripleCtrlSidebar}`
  )
  if (window.appConfig.tripleCtrlPreload === 'selection') {
    const tab = (await browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    }))[0]
    if (tab && tab.id) {
      const info = await message.send(tab.id, {
        type: 'PRELOAD_SELECTION'
      })
      try {
        url += '&info=' + encodeURIComponent(JSON.stringify(info))
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(e)
        }
      }
    }
  }

  lastQsMainWindow = tripleCtrlSidebar
    ? await browser.windows.getLastFocused()
    : void 0

  const qsPanelWin = await browser.windows.create({
    type: 'popup',
    url,
    width: qsPanelWidth,
    height: qsPanelHeight,
    left: Math.round(qsPanelLeft),
    top: Math.round(qsPanelTop)
  })

  if (qsPanelWin && qsPanelWin.id) {
    qsPanelID = qsPanelWin.id
    // notify all tabs
    ;(await browser.tabs.query({})).forEach(tab => {
      if (tab.id && tab.windowId !== qsPanelID) {
        message.send(tab.id, {
          type: 'QS_PANEL_CHANGED',
          payload: qsPanelID !== false
        })
      }
    })

    if (lastQsMainWindow && lastQsMainWindow.id) {
      await browser.windows.update(lastQsMainWindow.id, {
        state: 'normal',
        top: 0,
        left: tripleCtrlSidebar === 'left' ? qsPanelWidth : 1,
        width: window.screen.availWidth - qsPanelWidth,
        height: window.screen.availHeight
      })

      // fix a chrome bugs by moving 1 extra pixal then to 0
      if (tripleCtrlSidebar === 'right') {
        await browser.windows.update(lastQsMainWindow.id, {
          state: 'normal',
          top: 0,
          left: 0,
          width: window.screen.availWidth - qsPanelWidth,
          height: window.screen.availHeight
        })
      }
    }
  }
}

export async function searchClipboard(): Promise<void> {
  const text = await getClipboard()
  if (!text) return

  if (!qsPanelID) {
    await openQSPanel()
    await timer(1000)
  }

  await message.send({
    type: 'QS_PANEL_SEARCH_TEXT',
    payload: newWord({ text })
  })
}

async function closeQSPanel(): Promise<void> {
  if (
    window.appConfig.tripleCtrlSidebar &&
    lastQsMainWindow &&
    lastQsMainWindow.id
  ) {
    await browser.windows.update(lastQsMainWindow.id, {
      state: lastQsMainWindow.state,
      top: lastQsMainWindow.top,
      left: lastQsMainWindow.left,
      width: lastQsMainWindow.width,
      height: lastQsMainWindow.height
    })
  }
  lastQsMainWindow = void 0
}

function openSrcPage({
  id,
  text
}: Message<'OPEN_DICT_SRC_PAGE'>['payload']): Promise<void> {
  let getSrcPage: GetSrcPageFunction
  try {
    getSrcPage = require('@/components/dictionaries/' + id + '/engine')
      .getSrcPage
  } catch (err) {
    return Promise.reject(err)
  }
  return openURL(getSrcPage(text, window.appConfig, window.activeProfile))
}

function fetchDictResult(
  data: Message<'FETCH_DICT_RESULT'>['payload']
): Promise<MessageResponse<'FETCH_DICT_RESULT'>> {
  let search: SearchFunction<
    DictSearchResult<any>,
    NonNullable<(typeof data)['payload']>
  >

  try {
    search = require('@/components/dictionaries/' + data.id + '/engine').search
  } catch (err) {
    return Promise.reject(err)
  }

  const payload = data.payload || {}

  return timeout(
    search(data.text, window.appConfig, window.activeProfile, payload),
    25000
  )
    .catch(async (err: Error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(data.id, err)
      }

      if (err.message === 'NETWORK_ERROR') {
        // retry once
        await timer(500)
        return timeout(
          search(data.text, window.appConfig, window.activeProfile, payload),
          25000
        )
      }

      return Promise.reject(err)
    })
    .then(response => ({ ...response, id: data.id }))
    .catch(err => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(data.id, err)
      }
      return { result: null, id: data.id }
    })
}

async function callDictEngineMethod(
  data: Message<'DICT_ENGINE_METHOD'>['payload']
) {
  return require(`@/components/dictionaries/${data.id}/engine`)[data.method](
    ...(data.args || [])
  )
}

function getClipboard(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve('clipboard content')
  } else {
    let el = document.getElementById(
      'saladict-paste'
    ) as HTMLTextAreaElement | null
    if (!el) {
      el = document.createElement('textarea')
      el.id = 'saladict-paste'
      document.body.appendChild(el)
    }
    el.value = ''
    el.focus()
    document.execCommand('paste')
    return Promise.resolve(el.value || '')
  }
}

/** Bypass http restriction */
function youdaoTranslateAjax(request: any): Promise<any> {
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
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send(request.data)
    } else {
      xhr.send(null as any)
    }
  })
}
