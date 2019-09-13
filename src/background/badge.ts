import { message } from '@/_helpers/browser-api'

const currentTabInfo = {
  tabId: null as null | number,
  tempDisable: false,
  unsupported: false
}

export function initBadge() {
  /** Sent when content script loaded */
  message.addListener('SEND_TAB_BADGE_INFO', ({ payload }, sender) => {
    if (sender.tab && sender.tab.id === currentTabInfo.tabId) {
      currentTabInfo.tempDisable = payload.tempDisable
      currentTabInfo.unsupported = payload.unsupported
      updateBadge()
    }
  })

  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    if (tabId) {
      currentTabInfo.tabId = tabId

      try {
        const response = await message.send<'GET_TAB_BADGE_INFO'>(tabId, {
          type: 'GET_TAB_BADGE_INFO'
        })

        // response is empty if tab is just created
        if (response) {
          currentTabInfo.tempDisable = response.tempDisable
          currentTabInfo.unsupported = response.unsupported
          updateBadge()
        }

        return
      } catch (e) {
        console.warn(e)
      }
    }

    currentTabInfo.tabId = null
    currentTabInfo.tempDisable = false
    currentTabInfo.unsupported = false
    updateBadge()
  })
}

export function updateBadge() {
  if (!window.appConfig.active) {
    return setOff(currentTabInfo.tabId)
  }

  if (currentTabInfo.tabId) {
    if (currentTabInfo.tempDisable) {
      return setTempOff(currentTabInfo.tabId)
    }

    if (currentTabInfo.unsupported) {
      return setUnsupported(currentTabInfo.tabId)
    }
  }

  return setEmpty(currentTabInfo.tabId)
}

function setOff(tabId: number | null) {
  if (tabId) {
    browser.browserAction.setBadgeBackgroundColor({ color: '#C0392B', tabId })
    browser.browserAction.setBadgeText({ text: 'off', tabId })
    browser.browserAction.setTitle({
      title: require('@/_locales/' + window.appConfig.langCode + '/background')
        .locale.app.off,
      tabId
    })
  } else {
    browser.browserAction.setBadgeBackgroundColor({ color: '#C0392B' })
    browser.browserAction.setBadgeText({ text: 'off' })
    browser.browserAction.setTitle({
      title: require('@/_locales/' + window.appConfig.langCode + '/background')
        .locale.app.off
    })
  }
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

function setEmpty(tabId: number | null) {
  if (tabId) {
    browser.browserAction.setBadgeText({ text: '', tabId })
    browser.browserAction.setTitle({ title: '', tabId })
  } else {
    browser.browserAction.setBadgeText({ text: '' })
    browser.browserAction.setTitle({ title: '' })
  }
}
