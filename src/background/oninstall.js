import {storage} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'
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
      config = new AppConfig()
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

chrome.notifications.onClicked.addListener(id => {
  if (id !== 'oninstall') { return }
  chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki'})
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
})

chrome.notifications.onButtonClicked.addListener(id => {
  if (id !== 'oninstall') { return }
  chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki#%E6%94%AF%E6%8C%81%E5%9B%9B%E7%A7%8D%E5%88%92%E8%AF%8D%E6%96%B9%E5%BC%8F%E6%94%AF%E6%8C%81-iframe-%E5%88%92%E8%AF%8D'})
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
})

function showNews () {
  chrome.notifications.create('oninstall', {
    requireInteraction: true,
    type: 'basic',
    iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
    title: '沙拉查词 吐血更新【5.27.3】',
    message: (`
      增加有道分级网页翻译（支持 HTTPS）、自动发音、查词历史记录、词带内部双击查词、面板钉住时支持多种查词模式、必应无结果时增加相关词语、修复弹出框自动粘贴失效、查看页面二维码移到地址栏旁的图标中、Chrome 最低版本支持提升为 55、提升安全性、细节优化以及其它问题修复
      `.trim().replace(/\s*\n\s*/g, '\n') // remove leading&tailing spaces of each line
    ),
    buttons: [{title: '太多实在塞不下啦 ~ 点击查看完整介绍'}]
  })
}
