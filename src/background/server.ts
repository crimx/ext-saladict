import { TCDirection } from '@/app-config'
import { message, openURL } from '@/_helpers/browser-api'
import { timeout, timer } from '@/_helpers/promise-more'
import { getSuggests } from '@/_helpers/getSuggests'
import { DictSearchResult } from '@/typings/server'
import { SearchErrorType, SearchFunction, GetSrcPageFunction } from '@/components/dictionaries/helpers'
import { syncServiceInit, syncServiceDownload, syncServiceUpload } from './sync-manager'
import { isInNotebook, saveWord, deleteWords, getWordsByText, getWords } from './database'
import { play } from './audio-manager'
import './types'
import {
  MsgType,
  MsgOpenSrcPage,
  MsgAudioPlay,
  MsgFetchDictResult,
  MsgIsInNotebook,
  MsgSaveWord,
  MsgDeleteWords,
  MsgGetWordsByText,
  MsgGetWords,
  MsgQSPanelIDChanged,
  MsgSyncServiceInit,
  MsgSyncServiceDownload,
  MsgSyncServiceUpload,
  MsgGetSuggests,
  MsgDictEngineMethod,
  MsgWaveFormPlay,
} from '@/typings/message'

/** is a standalone panel running */
let qsPanelID: number | false = false
/** last focused window before standalone panel showing */
let lastQsMainWindow: browser.windows.Window | undefined

message.self.initServer()

// background script as transfer station
message.addListener((data, sender: browser.runtime.MessageSender) => {
  switch (data.type) {
    case MsgType.OpenSrcPage:
      return openSrcPage(data as MsgOpenSrcPage)
    case MsgType.OpenURL:
      return openURL(data.url, data.self)
    case MsgType.PlayAudio:
      return playAudio((data as MsgAudioPlay).src, sender)
    case MsgType.FetchDictResult:
      return fetchDictResult(data as MsgFetchDictResult, sender)
    case MsgType.DictEngineMethod:
      return callDictEngineMethod(data as MsgDictEngineMethod)
    case MsgType.GetClipboard:
      return getClipboard()
    case MsgType.RequestCSS:
      return injectCSS(sender)

    case MsgType.QueryQSPanel:
      return Promise.resolve(qsPanelID !== false)
    case MsgType.OpenQSPanel:
      return openQSPanel()
    case MsgType.CloseQSPanel:
      return closeQSPanel()

    case MsgType.IsInNotebook:
      return isInNotebook(data as MsgIsInNotebook)
    case MsgType.SaveWord:
      return saveWord(data as MsgSaveWord)
        .then(response => {
          setTimeout(() => message.send({ type: MsgType.WordSaved }), 0)
          return response
        })
    case MsgType.DeleteWords:
      return deleteWords(data as MsgDeleteWords)
        .then(response => {
          setTimeout(() => message.send({ type: MsgType.WordSaved }), 0)
          return response
        })
    case MsgType.GetWordsByText:
      return getWordsByText(data as MsgGetWordsByText)
    case MsgType.GetWords:
      return getWords(data as MsgGetWords)
    case MsgType.GetSuggests:
      return getSuggests((data as MsgGetSuggests).text)

    case MsgType.SyncServiceInit:
      return syncServiceInit(data as MsgSyncServiceInit)
    case MsgType.SyncServiceDownload:
      return syncServiceDownload(data as MsgSyncServiceDownload)
    case MsgType.SyncServiceUpload:
      return syncServiceUpload(data as MsgSyncServiceUpload)

    case 'youdao_translate_ajax' as any:
      return youdaoTranslateAjax(data.request)
  }
})

browser.windows.onRemoved.addListener(async winID => {
  if (winID === qsPanelID) {
    qsPanelID = false
    ;(await browser.tabs.query({})).forEach(tab => {
      if (tab.id && tab.windowId !== winID) {
        message.send<MsgQSPanelIDChanged>(tab.id, {
          type: MsgType.QSPanelIDChanged,
          flag: qsPanelID !== false,
        })
      }
    })
  }
})

export async function openQSPanel (): Promise<void> {
  if (qsPanelID !== false) {
    await browser.windows.update(qsPanelID, { focused: true })
    return
  }

  const { tripleCtrlLocation, panelWidth, tripleCtrlHeight, tripleCtrlSidebar } = window.appConfig
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
      case TCDirection.center:
        qsPanelLeft = (screen.width - panelWidth) / 2
        qsPanelTop = (screen.height - tripleCtrlHeight) / 2
        break
      case TCDirection.top:
        qsPanelLeft = (screen.width - panelWidth) / 2
        qsPanelTop = 30
        break
      case TCDirection.right:
        qsPanelLeft = screen.width - panelWidth - 30
        qsPanelTop = (screen.height - tripleCtrlHeight) / 2
        break
      case TCDirection.bottom:
        qsPanelLeft = (screen.width - panelWidth) / 2
        qsPanelTop = screen.height - 10
        break
      case TCDirection.left:
        qsPanelLeft = 10
        qsPanelTop = (screen.height - tripleCtrlHeight) / 2
        break
      case TCDirection.topLeft:
        qsPanelLeft = 10
        qsPanelTop = 30
        break
      case TCDirection.topRight:
        qsPanelLeft = screen.width - panelWidth - 30
        qsPanelTop = 30
        break
      case TCDirection.bottomLeft:
        qsPanelLeft = 10
        qsPanelTop = screen.height - 10
        break
      case TCDirection.bottomRight:
        qsPanelLeft = screen.width - panelWidth - 30
        qsPanelTop = screen.height - 10
        break
    }
  }

  let url = browser.runtime.getURL('quick-search.html')
  if (window.appConfig.tripleCtrlPreload === 'selection') {
    const tab = (await browser.tabs.query({ active: true, lastFocusedWindow: true }))[0]
    if (tab && tab.id) {
      const info = await message.send(tab.id, { type: MsgType.PreloadSelection })
      try {
        url += '?info=' + encodeURIComponent(JSON.stringify(info))
      } catch (e) {
        if (process.env.DEV_BUILD) {
          console.warn(e)
        }
      }
    }
  }

  lastQsMainWindow = tripleCtrlSidebar ? (await browser.windows.getLastFocused()) : void 0

  const qsPanelWin = await browser.windows.create({
    type: 'popup',
    url,
    width: qsPanelWidth,
    height: qsPanelHeight,
    left: Math.round(qsPanelLeft),
    top: Math.round(qsPanelTop),
  })

  if (qsPanelWin.id) {
    qsPanelID = qsPanelWin.id
    // notify all tabs
    ;(await browser.tabs.query({})).forEach(tab => {
      if (tab.id && tab.windowId !== qsPanelID) {
        message.send<MsgQSPanelIDChanged>(tab.id, {
          type: MsgType.QSPanelIDChanged,
          flag: qsPanelID !== false,
        })
      }
    })

    if (lastQsMainWindow && lastQsMainWindow.id) {
      await browser.windows.update(lastQsMainWindow.id, {
        state: 'normal',
        top: 0,
        left: tripleCtrlSidebar === 'left' ? qsPanelWidth : 1,
        width: window.screen.availWidth - qsPanelWidth,
        height: window.screen.availHeight,
      })

      // fix a chrome bugs by moving 1 extra pixal then to 0
      if (tripleCtrlSidebar === 'right') {
        await browser.windows.update(lastQsMainWindow.id, {
          state: 'normal',
          top: 0,
          left: 0,
          width: window.screen.availWidth - qsPanelWidth,
          height: window.screen.availHeight,
        })
      }
    }
  }
}

async function closeQSPanel (): Promise<void> {
  if (window.appConfig.tripleCtrlSidebar && lastQsMainWindow && lastQsMainWindow.id) {
    await browser.windows.update(lastQsMainWindow.id, {
      state: lastQsMainWindow.state,
      top: lastQsMainWindow.top,
      left: lastQsMainWindow.left,
      width: lastQsMainWindow.width,
      height: lastQsMainWindow.height,
    })
  }
  lastQsMainWindow = void 0
}

function openSrcPage (data: MsgOpenSrcPage): Promise<void> {
  let getSrcPage: GetSrcPageFunction
  try {
    getSrcPage = require('@/components/dictionaries/' + data.id + '/engine').getSrcPage
  } catch (err) {
    return Promise.reject(err)
  }
  return openURL(getSrcPage(data.text, window.appConfig, window.activeProfile))
}

function playAudio (src: string, sender: browser.runtime.MessageSender) {
  if (window.activeProfile.waveform) {
    return playWaveform(src, sender)
  }
  return play(src)
}

function playWaveform (src: string, sender: browser.runtime.MessageSender) {
  if (sender.tab && sender.tab.id) {
    return message.send<MsgWaveFormPlay>(
      sender.tab.id,
      {
        type: MsgType.PlayWaveform,
        src,
        tabId: sender.tab.id,
      }
    )
  }

  return message.send<MsgWaveFormPlay>({
    type: MsgType.PlayWaveform,
    src,
    tabId: 'popup',
  })
}

function fetchDictResult (
  data: MsgFetchDictResult,
  sender: browser.runtime.MessageSender,
): Promise<any> {
  let search: SearchFunction<DictSearchResult<any>, NonNullable<MsgFetchDictResult['payload']>>

  try {
    search = require('@/components/dictionaries/' + data.id + '/engine').search
  } catch (err) {
    return Promise.reject(err)
  }

  const payload = data.payload || {}

  return timeout(search(data.text, window.appConfig, window.activeProfile, payload), 25000)
    .catch(err => {
      if (process.env.DEV_BUILD) {
        console.warn(data.id, err)
      }

      if (err === SearchErrorType.NetWorkError) {
        // retry once
        return timer(500)
          .then(() => timeout(search(data.text, window.appConfig, window.activeProfile, payload), 25000))
      }

      return Promise.reject(err)
    })
    .then(({ result, audio }) => {
      if (audio) {
        const { cn, en } = window.appConfig.autopron
        if (audio.py && cn.dict === data.id) {
          playAudio(audio.py, sender)
        } else if (en.dict === data.id) {
          const accents = en.accent === 'uk'
            ? ['uk', 'us']
            : ['us', 'uk']

          accents.some(lang => {
            if (audio[lang]) {
              playAudio(audio[lang], sender)
              return true
            }
            return false
          })
        }
      }
      return result
    })
    .catch(err => {
      if (process.env.DEV_BUILD) {
        console.warn(data.id, err)
      }
      return null
    })
}

async function callDictEngineMethod (data: MsgDictEngineMethod) {
  return require(`@/components/dictionaries/${data.id}/engine`)[data.method](...(data.args || []))
}

function getClipboard (): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve('clipboard content')
  } else {
    let el = document.getElementById('saladict-paste') as HTMLTextAreaElement | null
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
function youdaoTranslateAjax (request): Promise<any> {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = event => {
      if (xhr.readyState === 4) {
        const data = xhr.status === 200 ? xhr.responseText : null
        resolve({
          'response': data,
          'index': request.index
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

function injectCSS (sender: browser.runtime.MessageSender) {
  if (sender.tab && sender.tab.id) {
    // Chrome fails to inject css via manifest if the page is loaded
    // as "last opened tabs" when browser opens.
    // Popup page is safe because it does not have a tab.
    return browser.tabs.insertCSS(sender.tab.id, { file: '/content.css' })
  }
}
