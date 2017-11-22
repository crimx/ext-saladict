import {storage, message} from 'src/helpers/chrome-api'

// listen context menu
chrome.contextMenus.onClicked.addListener(contextMenuOnClick)

// when config changes
storage.sync.listen('config', ({config: {newValue, oldValue}}) => {
  if (!oldValue) {
    return setContextMenu(newValue)
  }

  const oldSelected = oldValue.contextMenu.selected
  const newSelected = newValue.contextMenu.selected
  if (oldSelected.length !== newSelected.length) {
    return setContextMenu(newValue)
  }
  for (let i = 0; i < oldSelected.length; i += 1) {
    if (oldSelected[i] !== newSelected[i]) {
      return setContextMenu(newValue)
    }
  }
})

function contextMenuOnClick ({menuItemId, selectionText, linkUrl}) {
  switch (menuItemId) {
    case 'google_page_translate':
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length > 0) {
          chrome.tabs.create({url: `https://translate.google.com/translate?sl=auto&tl=zh-CN&js=y&prev=_t&ie=UTF-8&u=${tabs[0].url}&edit-text=&act=url`})
        }
      })
      break
    case 'youdao_page_translate':
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length > 0) {
          message.send(tabs[0].id, {msg: 'LOAD-YOUDAO-PAGE'})
        }
      })
      break
    case 'view_as_pdf':
      var pdfURL = chrome.runtime.getURL('assets/pdf/web/viewer.html')
      if (linkUrl) {
        // open link as pdf
        chrome.tabs.create({url: pdfURL + '?file=' + linkUrl})
      } else {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // if it is a pdf page
          if (tabs.length > 0 && /\.pdf$/i.test(tabs[0].url)) {
            chrome.tabs.create({url: pdfURL + '?file=' + tabs[0].url})
          } else {
            chrome.tabs.create({url: pdfURL})
          }
        })
      }
      break
    case 'search_history':
      chrome.tabs.create({url: chrome.runtime.getURL('history.html')})
      break
    case 'app_manual':
      chrome.tabs.create({url: 'https://github.com/crimx/crx-saladict/wiki'})
      break
    default:
      storage.sync.get('config', ({config}) => {
        const url = config.contextMenu.all[menuItemId]
        if (url) {
          chrome.tabs.create({url: url.replace('%s', selectionText)})
        }
      })
  }
}

/**
 * generate context menu items
 * @param {object} config
 */
export function setContextMenu (config) {
  chrome.contextMenus.removeAll(() => {
    // pdf
    chrome.contextMenus.create({
      id: 'view_as_pdf',
      title: chrome.i18n.getMessage('context_view_as_pdf') || 'View As PDF',
      contexts: ['link', 'browser_action']
    })

    var hasGooglePageTranslate = false
    var hasYoudaoPageTranslate = false
    config.contextMenu.selected.forEach(id => {
      var contexts = ['selection']
      if (id === 'google_page_translate') {
        hasGooglePageTranslate = true
        contexts = ['all']
      } else if (id === 'youdao_page_translate') {
        hasYoudaoPageTranslate = true
        contexts = ['all']
      }
      chrome.contextMenus.create({
        id,
        title: chrome.i18n.getMessage('context_' + id) || id,
        contexts
      })
    })

    // Only for browser action
    if (!hasGooglePageTranslate) {
      chrome.contextMenus.create({
        id: 'google_page_translate',
        title: chrome.i18n.getMessage('context_google_page_translate') || 'google_page_translate',
        contexts: ['browser_action']
      })
    }
    if (!hasYoudaoPageTranslate) {
      chrome.contextMenus.create({
        id: 'youdao_page_translate',
        title: chrome.i18n.getMessage('context_youdao_page_translate') || 'youdao_page_translate',
        contexts: ['browser_action']
      })
    }

    chrome.contextMenus.create({
      type: 'separator',
      id: Date.now().toString(),
      contexts: ['browser_action']
    })

    // search history
    chrome.contextMenus.create({
      id: 'search_history',
      title: chrome.i18n.getMessage('history_title') || 'Search History',
      contexts: ['browser_action']
    })

    // Manual
    chrome.contextMenus.create({
      id: 'app_manual',
      title: chrome.i18n.getMessage('context_manual_title') || 'Manual',
      contexts: ['browser_action']
    })
  })
}
