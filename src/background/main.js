import {storage, message} from 'src/helpers/chrome-api'
import './oninstall'
import './context-menus'

import AudioManager from './audio-manager'
const AUDIO = new AudioManager()

// background script as transfer station
message.listen((data, sender, sendResponse) => {
  if (/_SELF$/.test(data.msg)) {
    data.msg = data.msg.slice(0, -5)
    if (sender.tab) {
      message.send(sender.tab.id, data, response => {
        sendResponse(response)
      })
    } else {
      message.send(data, response => {
        sendResponse(response)
      })
    }
    return true
  }

  switch (data.msg) {
    case 'CREATE_TAB':
      chrome.tabs.create({url: data.url})
      break
    case 'AUDIO_PLAY':
      AUDIO.load(data.src)
      let timer = setTimeout(() => {
        timer = null
        sendResponse()
      }, 4000)
      AUDIO.listen('ended', () => {
        if (timer) {
          clearTimeout(timer)
          sendResponse()
        }
      })
      AUDIO.play()
      return true
    case 'FETCH_DICT_RESULT':
      return fetchDictResult(data, sender, sendResponse)
    case 'PAGE_ID':
      return sendResponse(getPageId(sender))
  }
})

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

function getPageId (sender) {
  if (sender.tab) {
    return sender.tab.id
  } else {
    return 'popup'
  }
}
