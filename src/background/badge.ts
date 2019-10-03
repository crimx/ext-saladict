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
  browser.browserAction.setBadgeBackgroundColor({ color: '#C0392B', tabId })
  browser.browserAction.setBadgeText({ text: 'off', tabId })
  browser.browserAction.setTitle({
    title: require('@/_locales/' + window.appConfig.langCode + '/background')
      .locale.app.off,
    tabId
  })
}

function setTempOff(tabId: number) {
  browser.browserAction.setBadgeBackgroundColor({ color: '#F39C12', tabId })
  browser.browserAction.setBadgeText({ text: 'off', tabId })
  browser.browserAction.setTitle({
    title: require('@/_locales/' + window.appConfig.langCode + '/background')
      .locale.app.tempOff,
    tabId
  })
}

function setUnsupported(tabId: number) {
  browser.browserAction.setBadgeBackgroundColor({ color: '#F39C12', tabId })
  browser.browserAction.setBadgeText({ text: 'off', tabId })
  browser.browserAction.setTitle({
    title: require('@/_locales/' + window.appConfig.langCode + '/background')
      .locale.app.unsupported,
    tabId
  })
}

function setEmpty(tabId: number) {
  browser.browserAction.setBadgeText({ text: '', tabId })
  browser.browserAction.setTitle({ title: '', tabId })
}
