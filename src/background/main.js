import {storage, message} from 'src/helpers/chrome-api'
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
    case 'CREATE_TAB':
      chrome.tabs.create({
        url: data.escape
          ? data.url
            .replace('%s', this.text)
            .replace('%z', chsToChz(this.text))
          : data.url
      })
      break
    case 'AUDIO_PLAY':
      AUDIO.load(data.src)
      Promise.race([
        promiseTimer(4000),
        new Promise(resolve => AUDIO.listen('ended', resolve))
      ]).then(sendResponse)
      AUDIO.play()
      return true
    case 'FETCH_DICT_RESULT':
      return fetchDictResult(data, sender, sendResponse)
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
