import { message, openURL } from '@/_helpers/browser-api'
import { play } from './audio-manager'
import { isInNotebook, saveWord, deleteWord, getWordsByText, getAllWords } from './database'
import { chsToChz } from '@/_helpers/chs-to-chz'
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

function fetchDictResult (data: MsgFetchDictResult): Promise<{ result: any, id: typeof data.id }> {
  let search

  try {
    search = require('@/components/dictionaries/' + data.id + '/engine')
    if (typeof search !== 'function') {
      search = search.default
    }
  } catch (err) {
    return Promise.reject(err)
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`search ${data.text}`)
    search = () => new Promise(resolve => setTimeout(() => resolve({ result: 'yeyeye' }), Math.random() * 5000 + 1000))
  }

  return search(data.text)
    .then(result => ({ result, id: data.id }))
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
