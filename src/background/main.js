import {message} from 'src/helpers/chrome-api'

// receive signals from page and all frames
message.on('SELECTION', (data, sender, sendResponse) => {
  message.send(sender.tab.id, data)
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear()
  chrome.storage.sync.clear()
})
