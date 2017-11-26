import {storage, message, openURL} from 'src/helpers/chrome-api'
import {promiseTimer} from 'src/helpers/promise-more'
import './oninstall'
import './context-menus'
import AudioManager from './audio-manager'
import chsToChz from 'src/helpers/chs-to-chz'
const AUDIO = new AudioManager()

message.server()

// background script as transfer station
message.listen((data, sender, sendResponse) => {
  switch (data.msg) {
    case 'OPEN_URL':
      return createTab(data, sender, sendResponse)
    case 'AUDIO_PLAY':
      return playAudio(data, sender, sendResponse)
    case 'FETCH_DICT_RESULT':
      return fetchDictResult(data, sender, sendResponse)
    case 'PRELOAD_SELECTION':
      return preloadSelection(data, sender, sendResponse)
  }
})

function createTab (data, sender, sendResponse) {
  openURL(
    data.escape
      ? data.url
        .replace('%s', this.text)
        .replace('%z', chsToChz(this.text))
      : data.url
  )
  sendResponse()
}

function playAudio (data, sender, sendResponse) {
  AUDIO.load(data.src)
  Promise.race([
    promiseTimer(4000),
    new Promise(resolve => AUDIO.listen('ended', resolve))
  ]).then(sendResponse)
  AUDIO.play()
  return true
}

function fetchDictResult (data, sender, sendResponse) {
  const search = require('src/dictionaries/' + data.dict + '/engine.js').default
  if (!search) {
    sendResponse({error: 'Missing Dictionary!'})
    return
  }

  storage.sync.get('config', ({config}) => {
    search(data.text, config, {AUDIO})
      .then(result => sendResponse({result, dict: data.dict}))
      .catch(error => sendResponse({error, dict: data.dict}))
  })

  // keep the channel alive
  return true
}

function preloadSelection (data, sender, sendResponse) {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (tabs.length > 0) {
      message.send(tabs[0].id, {msg: '__PRELOAD_SELECTION__'}, text => {
        sendResponse(text || '')
      })
    } else {
      sendResponse('')
    }
  })
  return true
}
