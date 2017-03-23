import {message} from 'src/helpers/chrome-api'

// background script as transfer station
message.listen((data, sender, sendResponse) => {
  if (data.self) {
    message.send(sender.tab.id, data)
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear()
  chrome.storage.sync.clear()
})
