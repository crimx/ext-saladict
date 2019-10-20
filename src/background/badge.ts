import { message } from '@/_helpers/browser-api'
import { Subject } from 'rxjs'
import { switchMapBy } from '@/_helpers/observables'
import { timer } from '@/_helpers/promise-more'

interface UpdateBadgeOptions {
  active: boolean
  tempDisable: boolean
  unsupported: boolean
}

const onUpdated$ = new Subject<{
  tabId: number
  options?: UpdateBadgeOptions
}>()

onUpdated$
  .pipe(
    switchMapBy('tabId', async o => {
      if (o.options) {
        return o as Required<typeof o>
      }
      await timer(1000)
      return {
        tabId: o.tabId,
        options: (await message
          .send<'GET_TAB_BADGE_INFO'>(o.tabId, {
            type: 'GET_TAB_BADGE_INFO'
          })
          .catch(() => {})) || {
          active: window.appConfig.active,
          tempDisable: false,
          unsupported: true
        }
      }
    })
  )
  .subscribe(({ tabId, options }) => {
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
  })

export function initBadge() {
  /** Sent when content script loaded */
  message.addListener('SEND_TAB_BADGE_INFO', ({ payload }, sender) => {
    if (sender.tab && sender.tab.id) {
      onUpdated$.next({ tabId: sender.tab.id, options: payload })
    }
  })

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      onUpdated$.next({ tabId })
    }
  })
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
