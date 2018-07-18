import { message, openURL } from '@/_helpers/browser-api'
import { play } from './audio-manager'
import { isInNotebook, saveWord, deleteWords, getWordsByText, getWords } from './database'
import { chsToChz } from '@/_helpers/chs-to-chz'
import appConfigFactory, { AppConfig } from '@/app-config'
import { createAppConfigStream } from '@/_helpers/config-manager'
import { DictSearchResult } from '@/typings/server'
import { timeout } from '@/_helpers/promise-more'
import {
  MsgType,
  MsgOpenUrl,
  MsgAudioPlay,
  MsgFetchDictResult,
  MsgIsInNotebook,
  MsgSaveWord,
  MsgDeleteWords,
  MsgGetWordsByText,
  MsgGetWords,
} from '@/typings/message'

let config = appConfigFactory()

createAppConfigStream().subscribe(newConfig => config = newConfig)

message.self.initServer()

// background script as transfer station
message.addListener((data, sender: browser.runtime.MessageSender) => {
  switch (data.type) {
    case MsgType.OpenURL:
      return createTab(data as MsgOpenUrl)
    case MsgType.PlayAudio:
      return playAudio(data as MsgAudioPlay)
    case MsgType.FetchDictResult:
      return fetchDictResult(data as MsgFetchDictResult)
    case MsgType.GetClipboard:
      return getClipboard()
    case MsgType.RequestCSS:
      return injectCSS(sender)

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
    case MsgType.GetWordsByText:
      return getWordsByText(data as MsgGetWordsByText)
    case MsgType.GetWords:
      return getWords(data as MsgGetWords)

    case 'youdao_translate_ajax' as any:
      return youdaoTranslateAjax(data.request)
  }
})

function createTab (data: MsgOpenUrl): Promise<void> {
  return openURL(
    data.placeholder
      ? data.url
        .replace(/%s/g, data.text)
        .replace(/%z/g, chsToChz(data.text))
        .replace(/%h/g, data.text.trim().split(/\s+/).join('-'))
      : data.url,
    data.self
  )
}

function playAudio (data: MsgAudioPlay): Promise<void> {
  return play(data.src)
}

function fetchDictResult (
  data: MsgFetchDictResult
): Promise<any> {
  let search: (
    text: string,
    config: AppConfig
  ) => Promise<DictSearchResult<any>>

  try {
    search = require('@/components/dictionaries/' + data.id + '/engine').default
  } catch (err) {
    return Promise.reject(err)
  }

  const pSearch = search(data.text, config)
    .then(({ result, audio }) => {
      if (audio) {
        const { cn, en } = config.autopron
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

  return timeout(pSearch, 25000)
    .catch(err => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(data.id, err)
      }
      return null
    })
}

function getClipboard (): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve('clipboard content')
  } else {
    const el = document.createElement('input')
    document.body.appendChild(el)
    el.focus()
    document.execCommand('paste')
    el.remove()
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
      xhr.send(null)
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
