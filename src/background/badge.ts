import { message } from '@/_helpers/browser-api'

export function initBadge() {
  /** Sent when content script loaded */
  message.addListener('SEND_TAB_BADGE_INFO', ({ payload }, sender) => {
    if (sender.tab && sender.tab.id) {
      updateBadge(sender.tab.id, payload)
    }
  })

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      try {
        const response = await message.send<'GET_TAB_BADGE_INFO'>(tabId, {
          type: 'GET_TAB_BADGE_INFO'
        })
        updateBadge(tabId, response)
      } catch (e) {
        updateBadge(tabId, {
          active: window.appConfig.active,
          tempDisable: false,
          unsupported: true
        })
      }
    }
  })
}

export function updateBadge(
  tabId: number,
  options: {
    active: boolean
    tempDisable: boolean
    unsupported: boolean
  }
) {
  if (!options.active) {
    return setOff(tabId)
  }

  if (options.tempDisable) {
    return setTempOff(tabId)
  }

  if (options.unsupported) {
    return setUnsupported(tabId)
  }

  return setEmpty(tabId)
}

function setOff(tabId: number) {
  setIcon(true, tabId)
  browser.browserAction.setTitle({
    title: require('@/_locales/' + window.appConfig.langCode + '/background')
      .locale.app.off,
    tabId
  })
}

function setTempOff(tabId: number) {
  setIcon(true, tabId)
  browser.browserAction.setTitle({
    title: require('@/_locales/' + window.appConfig.langCode + '/background')
      .locale.app.tempOff,
    tabId
  })
}

function setUnsupported(tabId: number) {
  setIcon(true, tabId)
  browser.browserAction.setTitle({
    title: require('@/_locales/' + window.appConfig.langCode + '/background')
      .locale.app.unsupported,
    tabId
  })
}

function setEmpty(tabId: number) {
  setIcon(false, tabId)
  browser.browserAction.setTitle({ title: '', tabId })
}

function setIcon(gray: boolean, tabId: number) {
  browser.browserAction.setIcon({
    tabId,
    path: gray
      ? {
          16: 'assets/icon-gray-16.png',
          19: 'assets/icon-gray-19.png',
          24: 'assets/icon-gray-24.png',
          38: 'assets/icon-gray-38.png',
          48: 'assets/icon-gray-48.png',
          128: 'assets/icon-gray-128.png'
        }
      : {
          16: 'assets/icon-16.png',
          19: 'assets/icon-19.png',
          24: 'assets/icon-24.png',
          38: 'assets/icon-38.png',
          48: 'assets/icon-48.png',
          128: 'assets/icon-128.png'
        }
  })
}
