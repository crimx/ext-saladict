import {storage, openURL} from 'src/helpers/chrome-api'
import checkUpdate from 'src/helpers/check-update'
import AppConfig from 'src/app-config'
import mergeConfig from './merge-config'
import {initContextMenuListener, setContextMenu} from './context-menus'

chrome.runtime.onInstalled.addListener(onInstalled)
chrome.runtime.onStartup.addListener(onStartup)
chrome.notifications.onClicked.addListener(clickListener)
chrome.notifications.onButtonClicked.addListener(btnClickListener)

function onInstalled ({reason, previousVersion}) {
  clearHistory()
  mergeRecords('history')
  mergeRecords('notebook')
  // merge config on installed
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
          openURL('https://github.com/crimx/crx-saladict/wiki/Instructions')
        } else if (reason === 'update') {
          // ignore patch updates
          if (!previousVersion || previousVersion.replace(/[^.]*$/, '') !== chrome.runtime.getManifest().version.replace(/[^.]*$/, '')) {
            showNews()
          }
        }
        setContextMenu(config)
        initContextMenuListener()
      })
    storage.local.set({lastCheckUpdate: Date.now()})
  })
}

function onStartup () {
  // check update every month
  storage.local.get('lastCheckUpdate')
    .then(({lastCheckUpdate}) => {
      const today = Date.now()
      if (lastCheckUpdate && today - lastCheckUpdate < 30 * 24 * 60 * 60 * 1000) {
        return
      }
      checkUpdate().then(({info, isAvailable}) => {
        storage.local.set({lastCheckUpdate: today})
        if (isAvailable) {
          chrome.notifications.create('update', {
            requireInteraction: true,
            type: 'basic',
            iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
            title: '沙拉查词',
            message: (`可更新至【${info.tag_name}】`
            ),
            buttons: [{title: '查看更新'}]
          })
        }
      })
    })
}

function clickListener (id) {
  if (!/^(oninstall|update)$/.test(id)) { return }
  openURL('https://github.com/crimx/crx-saladict/wiki')
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
}

function btnClickListener (id) {
  if (!/^(oninstall|update)$/.test(id)) { return }
  openURL('https://github.com/crimx/crx-saladict/releases')
  chrome.notifications.getAll(notifications => {
    Object.keys(notifications).forEach(id => chrome.notifications.clear(id))
  })
}

function showNews () {
  chrome.notifications.create('oninstall', {
    requireInteraction: true,
    type: 'basic',
    iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
    title: '沙拉查词 Saladict【5.31.5】',
    message: (`
      1. 可以直接点击 PDF 链接打开了！
      2. 钉住时快速查询不移动窗口
      3. 设置页面增加反馈链接（用赞赏来反馈问题的朋友看这里，赞赏没法回复的。在第三方下载注意对比 ID）
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

// ['historyCat', 'notebookCat']
function mergeRecords (area) {
  const catName = area + 'Cat'
  storage.local.get(catName)
    .then(response => {
      const catalog = response[catName]
      if (!catalog || catalog.version === 2) { return }
      storage.local.get(catalog.data)
        .then(allSet => {
          catalog.data.forEach((id, i) => {
            const recordSet = allSet[id]
            if (recordSet) {
              recordSet.data.forEach(records => {
                records.data = records.data.map(text => ({
                  text,
                  context: '',
                  title: chrome.i18n.getMessage('from_saladict_old'),
                  url: '#',
                  favicon: chrome.runtime.getURL('assets/icon-16.png'),
                  trans: '',
                  note: ''
                }))
              })
              storage.local.set({[id]: recordSet})
            } else {
              catalog[i] = null
            }
          })
          catalog.version = 2
          catalog.data = catalog.data.filter(Boolean)
          storage.local.set({[catName]: catalog})
        })
    })
}
