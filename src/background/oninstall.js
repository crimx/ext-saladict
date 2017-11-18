import {storage} from 'src/helpers/chrome-api'
import defaultConfig from 'src/app-config'
import mergeConfig from './merge-config'
import {setContextMenu} from './context-menus'

// merge config on installed
chrome.runtime.onInstalled.addListener(({reason}) => {
  let isNew = false
  storage.sync.get('config', ({config}) => {
    if (config && config.dicts && config.dicts.all) {
      // got the correct version of config
      config = mergeConfig(config)
    } else {
      storage.local.clear()
      storage.sync.clear()
      config = JSON.parse(JSON.stringify(defaultConfig))
      isNew = true
    }

    storage.sync.set({config})
      .then(() => {
        if (isNew) {
          chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki'})
        } else if (reason === 'update') {
          showNews()
        }
        setContextMenu(config)
      })
  })
})

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki'})
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
})

chrome.notifications.onButtonClicked.addListener(() => {
  chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki#%E6%94%AF%E6%8C%81%E5%9B%9B%E7%A7%8D%E5%88%92%E8%AF%8D%E6%96%B9%E5%BC%8F%E6%94%AF%E6%8C%81-iframe-%E5%88%92%E8%AF%8D'})
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
})

function showNews () {
  chrome.notifications.create({
    requireInteraction: true,
    type: 'basic',
    iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
    title: '沙拉查词 Saladict',
    message: (`
      `.trim().replace(/\s*\n\s*/g, '\n') // remove leading&tailing spaces of each line
    ),
    buttons: [{title: '点击了解使用方式'}]
  })
}
