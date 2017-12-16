import {storage, openURL} from 'src/helpers/chrome-api'

function contextMenuOnClick ({menuItemId, selectionText, linkUrl}) {
  switch (menuItemId) {
    case 'google_page_translate':
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length > 0) {
          openURL(`https://translate.google.com/translate?sl=auto&tl=zh-CN&js=y&prev=_t&ie=UTF-8&u=${tabs[0].url}&edit-text=&act=url`)
        }
      })
      break
    case 'youdao_page_translate':
      // inject youdao script, defaults to the active tab of the current window.
      chrome.tabs.executeScript(
        {file: 'assets/fanyi.youdao.2.0/main.js'},
        result => {
          if (chrome.runtime.lastError || !result || (result !== 1 && result[0] !== 1)) {
            // error msg
            chrome.notifications.create({
              type: 'basic',
              eventTime: Date.now() + 4000,
              iconUrl: chrome.runtime.getURL(`assets/icon-128.png`),
              title: 'Saladict',
              message: chrome.i18n.getMessage('notification_youdao_err')
            })
          }
        }
      )
      break
    case 'view_as_pdf':
      var pdfURL = chrome.runtime.getURL('assets/pdf/web/viewer.html')
      if (linkUrl) {
        // open link as pdf
        openURL(pdfURL + '?file=' + linkUrl)
      } else {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // if it is a pdf page
          if (tabs.length > 0 && /\.pdf$/i.test(tabs[0].url)) {
            openURL(pdfURL + '?file=' + tabs[0].url)
          } else {
            openURL(pdfURL)
          }
        })
      }
      break
    case 'search_history':
      openURL(chrome.runtime.getURL('history.html'))
      break
    case 'notebook':
      openURL(chrome.runtime.getURL('notebook.html'))
      break
    default:
      storage.sync.get('config', ({config}) => {
        const url = config.contextMenu.all[menuItemId]
        if (url) {
          openURL(url.replace('%s', selectionText))
        }
      })
  }
}

export function initContextMenuListener () {
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
      id: 'notebook',
      title: chrome.i18n.getMessage('context_notebook_title') || 'New Word List',
      contexts: ['browser_action']
    })
  })
}
