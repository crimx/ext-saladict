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
} from '@/typings/message'

/** is a standalone panel running */
let qsPanelID: number | false = false

message.self.initServer()

// background script as transfer station
message.addListener((data, sender: browser.runtime.MessageSender) => {
  switch (data.type) {
    case MsgType.OpenSrcPage:
      return openSrcPage(data as MsgOpenSrcPage)
    case MsgType.OpenURL:
      return openURL(data.url, data.self)
    case MsgType.PlayAudio:
      return playAudio(data as MsgAudioPlay)
    case MsgType.FetchDictResult:
      return fetchDictResult(data as MsgFetchDictResult)
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
      return syncServiceInit((data as MsgSyncServiceInit).config)
    case MsgType.SyncServiceDownload:
      return syncServiceDownload((data as MsgSyncServiceDownload).force)
    case MsgType.SyncServiceUpload:
      return syncServiceUpload((data as MsgSyncServiceUpload).force)

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
  } else {
    const { tripleCtrlLocation, panelWidth, tripleCtrlHeight } = window.appConfig
    let left = 10
    let top = 30
    switch (tripleCtrlLocation) {
      case TCDirection.center:
        left = (screen.width - panelWidth) / 2
        top = (screen.height - tripleCtrlHeight) / 2
        break
      case TCDirection.top:
        left = (screen.width - panelWidth) / 2
        top = 30
        break
      case TCDirection.right:
        left = screen.width - panelWidth - 30
        top = (screen.height - tripleCtrlHeight) / 2
        break
      case TCDirection.bottom:
        left = (screen.width - panelWidth) / 2
        top = screen.height - 10
        break
      case TCDirection.left:
        left = 10
        top = (screen.height - tripleCtrlHeight) / 2
        break
      case TCDirection.topLeft:
        left = 10
        top = 30
        break
      case TCDirection.topRight:
        left = screen.width - panelWidth - 30
        top = 30
        break
      case TCDirection.bottomLeft:
        left = 10
        top = screen.height - 10
        break
      case TCDirection.bottomRight:
        left = screen.width - panelWidth - 30
        top = screen.height - 10
        break
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

    const qsPanelWin = await browser.windows.create({
      type: 'popup',
      url,
      width: window.appConfig.panelWidth,
      height: window.appConfig.tripleCtrlHeight,
      left: Math.round(left),
      top: Math.round(top),
    })

    if (qsPanelWin.id) {
      qsPanelID = qsPanelWin.id
      ;(await browser.tabs.query({})).forEach(tab => {
        if (tab.id && tab.windowId !== qsPanelID) {
          message.send<MsgQSPanelIDChanged>(tab.id, {
            type: MsgType.QSPanelIDChanged,
            flag: qsPanelID !== false,
          })
        }
      })
    }
  }
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

function playAudio (data: MsgAudioPlay): Promise<void> {
  return play(data.src)
}

function fetchDictResult (
  data: MsgFetchDictResult
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
          play(audio.py)
        } else if (en.dict === data.id) {
          const accents = en.accent === 'uk'
            ? ['uk', 'us']
            : ['us', 'uk']

          accents.some(lang => {
            if (audio[lang]) {
              play(audio[lang])
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
