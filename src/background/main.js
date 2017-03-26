import {storage, message} from 'src/helpers/chrome-api'
import defaultConfig from 'src/app-config'

var config = defaultConfig

// background script as transfer station
message.listen((data, sender, sendResponse) => {
  if (data.self) {
    message.send(sender.tab.id, data, response => {
      sendResponse(response)
    })
  }
  return true
})

const dicts = {}
// dynamic load components
const compReq = require.context('./dicts', true, /\.js$/i)
const idChecker = /\/(\S+)\.js$/i
compReq.keys().forEach(path => {
  let id = idChecker.exec(path)
  if (!id) { return }
  id = id[1].toLowerCase()

  let search = compReq(path)
  if (typeof search !== 'function') {
    search = search.default
  }
  dicts[id] = {
    search,
    config: JSON.parse(JSON.stringify(defaultConfig))
  }
})

function setConfigs (config) {
  Object.keys(dicts).forEach(id => {
    dicts[id].config = JSON.parse(JSON.stringify(defaultConfig))
  })
}

storage.sync.get('config', data => {
  if (data.config) {
    config = data.config
    setConfigs(config)
  } else {
    storage.local.clear()
    storage.sync.clear()
      .then(() => storage.sync.set({config}))
  }
})

storage.listen('config', changes => {
  config = changes.config.newValue
  setConfigs(config)
})

message.on('SEARCH_TEXT', (data, sender, sendResponse) => {
  let dict = dicts[data.dict]
  if (!dict) {
    sendResponse({error: 'Missing Dictionary!'})
    return
  }

  function handleSuccess (result) {
    sendResponse({result, dict: data.dict})
  }

  function handleError (error) {
    sendResponse({error, dict: data.dict})
  }

  dict.search(data.text, dict.config)
    .then(handleSuccess, handleError)
    .catch(handleError)

  // keep the channel alive
  return true
})
