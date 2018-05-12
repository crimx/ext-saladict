import { message, openURL } from '@/_helpers/browser-api'
import { play } from './audio-manager'
import { isInNotebook, saveWord, deleteWord, getWordsByText, getAllWords } from './database'
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
  MsgDeleteWord,
  MsgGetWordsByText,
  MsgGetAllWords,
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
    case MsgType.PreloadSelection:
      return preloadSelection()
    case MsgType.GetClipboard:
      return getClipboard()

    case MsgType.IsInNotebook:
      return isInNotebook(data as MsgIsInNotebook)
    case MsgType.SaveWord:
      return saveWord(data as MsgSaveWord)
    case MsgType.DeleteWord:
      return deleteWord(data as MsgDeleteWord)
    case MsgType.GetWordsByText:
      return getWordsByText(data as MsgGetWordsByText)
    case MsgType.GetAllWords:
      return getAllWords(data as MsgGetAllWords)
  }
})

function createTab (data: MsgOpenUrl): Promise<void> {
  return openURL(
    data.placeholder
      ? data.url
        .replace(/%s/g, data.text)
        .replace(/%z/g, chsToChz(data.text))
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
          if (audio.uk && en.accent === 'uk') {
            play(audio.uk)
          } else if (audio.us && en.accent === 'us') {
            play(audio.us)
          }
        }
      }
      return result
    })

  return timeout(pSearch, 10000)
    .catch(err => {
      console.warn(data.id, err)
      return null
    })
}

function preloadSelection (): Promise<void> {
  return browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].id != null) {
        return message.send(tabs[0].id as number, { type: MsgType.__PreloadSelection__ })
      }
    })
    .then(text => text || '')
    .catch(() => '')
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
