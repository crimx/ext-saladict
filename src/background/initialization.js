import {storage, openURL} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'
import mergeConfig from './merge-config'
import {setContextMenu} from './context-menus'

// merge config on installed
chrome.runtime.onInstalled.addListener(({reason}) => {
  clearHistory()
  let isNew = false
  storage.sync.get('config', ({config}) => {
    if (config && config.dicts && config.dicts.all) {
      // got the correct version of config
      config = mergeConfig(config)
    } else {
      storage.local.clear()
      storage.sync.clear()
      config = new AppConfig()
      isNew = true
    }

    storage.sync.set({config})
      .then(() => {
        if (isNew) {
          openURL('https://github.com/crimx/crx-saladict/wiki')
        } else if (reason === 'update') {
          showNews()
        }
        setContextMenu(config)
      })
  })
})

chrome.notifications.onClicked.addListener(clickListener)
chrome.notifications.onButtonClicked.addListener(btnClickListener)

function clickListener (id) {
  if (id !== 'oninstall') { return }
  openURL('https://github.com/crimx/crx-saladict/wiki')
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
  chrome.notifications.onClicked.removeListener(clickListener)
  chrome.notifications.onButtonClicked.removeListener(btnClickListener)
}

function btnClickListener (id) {
  if (id !== 'oninstall') { return }
  openURL('https://github.com/crimx/crx-saladict/releases')
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
  chrome.notifications.onClicked.removeListener(clickListener)
  chrome.notifications.onButtonClicked.removeListener(btnClickListener)
}

function showNews () {
  chrome.notifications.create('oninstall', {
    requireInteraction: true,
    type: 'basic',
    iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
    title: '沙拉查词',
    message: (`
      【5.28.1】
      1. 增加生词本！
      2. 可配置预加载内容（剪贴板或页面选中词）与自动开始查词，快捷查词可设置出现的位置
      3. 增强系统稳定性
      `.trim().replace(/\s*\n\s*/g, '\n') // remove leading&tailing spaces of each line
    ),
    buttons: [{title: '查看更新'}]
  })
}

/**
 * Old version
 */
function clearHistory () {
  storage.local.get(['folderCatalog', 'collectionCatalog'])
    .then(({folderCatalog, collectionCatalog}) => {
      return storage.local.remove(
        ['folderCatalog', 'collectionCatalog']
          .concat(
            folderCatalog ? folderCatalog.data : [],
            collectionCatalog || []
          )
      )
    })
}
