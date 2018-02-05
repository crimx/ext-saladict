import { DictID } from '@/app-config'
import { message, openURL } from '@/_helpers/browser-api'
import { play } from './audio-manager'
import { chsToChz } from '@/_helpers/chs-to-chz'

interface MessageOpenUrlWithEscape {
  type: 'OPEN_URL'
  url: string
  escape: true
  text: string
}

interface MessageOpenUrlWithoutEscape {
  type: 'OPEN_URL'
  url: string
  escape?: false
}

type MessageOpenUrl = MessageOpenUrlWithoutEscape | MessageOpenUrlWithEscape

interface MessageAudioPlay {
  type: 'AUDIO_PLAY'
  src: string
}

interface MessageFetchDictResult {
  type: 'FETCH_DICT_RESULT'
  dict: DictID
  text: string
}

message.self.initServer()

// background script as transfer station
message.addListener((data, sender: browser.runtime.MessageSender): Promise<void> | undefined => {
  switch (data.type) {
    case 'OPEN_URL':
      return createTab(data)
    case 'AUDIO_PLAY':
      return playAudio(data)
    case 'FETCH_DICT_RESULT':
      return fetchDictResult(data)
    case 'PRELOAD_SELECTION':
      return preloadSelection()
  }
})

function createTab (data: MessageOpenUrl): Promise<void> {
  return openURL(
    data.escape
      ? data.url
        .replace(/%s/g, data.text)
        .replace(/%z/g, chsToChz(data.text))
      : data.url
  )
}

function playAudio (data: MessageAudioPlay): Promise<void> {
  return play(data.src)
}

function fetchDictResult (data: MessageFetchDictResult): Promise<void> {
  let search

  try {
    search = require('@/components/dictionaries/' + data.dict + '/engine.js')
  } catch (err) {
    return Promise.reject(err)
  }

  return search(data.text)
    .then(result => ({ result, dict: data.dict }))
}

function preloadSelection (): Promise<void> {
  return browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].id != null) {
        return message.send(tabs[0].id as number, { type: '__PRELOAD_SELECTION__' })
      }
    })
    .then(text => text || '')
    .catch(() => '')
}
