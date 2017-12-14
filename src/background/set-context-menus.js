/**
 * generate context menu items
 * @param {object} config
 */
export default function setContextMenu (config) {
  if (window.isSettingContexMenu) {
    window.onHoldContexMenuConfig = config
    return
  }
  window.isSettingContexMenu = true

  chrome.contextMenus.removeAll(() => {
    const promiseQueue = []

    promiseQueue.push(
      new Promise(resolve => {
        // pdf
        chrome.contextMenus.create({
          id: 'view_as_pdf',
          title: chrome.i18n.getMessage('context_view_as_pdf') || 'View As PDF',
          contexts: ['link', 'browser_action']
        }, resolve)
      })
    )

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
      promiseQueue.push(
        new Promise(resolve => {
          chrome.contextMenus.create({
            id,
            title: chrome.i18n.getMessage('context_' + id) || id,
            contexts
          }, resolve)
        })
      )
    })

    // Only for browser action
    if (!hasGooglePageTranslate) {
      promiseQueue.push(
        new Promise(resolve => {
          chrome.contextMenus.create({
            id: 'google_page_translate',
            title: chrome.i18n.getMessage('context_google_page_translate') || 'google_page_translate',
            contexts: ['browser_action']
          }, resolve)
        })
      )
    }
    if (!hasYoudaoPageTranslate) {
      promiseQueue.push(
        new Promise(resolve => {
          chrome.contextMenus.create({
            id: 'youdao_page_translate',
            title: chrome.i18n.getMessage('context_youdao_page_translate') || 'youdao_page_translate',
            contexts: ['browser_action']
          }, resolve)
        })
      )
    }

    promiseQueue.push(
      new Promise(resolve => {
        chrome.contextMenus.create({
          type: 'separator',
          id: Date.now().toString(),
          contexts: ['browser_action']
        }, resolve)
      }),
      new Promise(resolve => {
        // search history
        chrome.contextMenus.create({
          id: 'search_history',
          title: chrome.i18n.getMessage('history_title') || 'Search History',
          contexts: ['browser_action']
        }, resolve)
      }),
      new Promise(resolve => {
        // Manual
        chrome.contextMenus.create({
          id: 'notebook',
          title: chrome.i18n.getMessage('context_notebook_title') || 'New Word List',
          contexts: ['browser_action']
        }, resolve)
      })
    )

    Promise.all(promiseQueue)
      .then(() => {
        window.isSettingContexMenu = false
        if (window.onHoldContexMenuConfig) {
          const config = window.onHoldContexMenuConfig
          window.onHoldContexMenuConfig = null
          setContextMenu(config)
        }
      })
  })
}
