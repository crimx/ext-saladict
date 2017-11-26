/**
 * generate context menu items
 * @param {object} config
 */
export default function setContextMenu (config) {
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
