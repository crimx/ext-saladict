import mapValues from 'lodash/mapValues'
import { message, storage, openURL } from '@/_helpers/browser-api'
import { isExtTainted } from '@/_helpers/integrity'
import { checkUpdate } from '@/_helpers/check-update'
import { updateConfig, initConfig } from '@/_helpers/config-manager'
import { initProfiles, updateActiveProfileID } from '@/_helpers/profile-manager'
import { injectDictPanel } from '@/_helpers/injectSaladictInternal'
import { isFirefox } from '@/_helpers/saladict'
import { timer } from '@/_helpers/promise-more'
import {
  getTitlebarOffset,
  setTitlebarOffset,
  calibrateTitlebarOffset
} from '@/_helpers/titlebar-offset'
import { reportEvent } from '@/_helpers/analytics'
import { ContextMenus } from './context-menus'
import { BackgroundServer } from './server'
import { openPDF } from './pdf-sniffer'
import './types'

browser.runtime.onInstalled.addListener(onInstalled)
browser.runtime.onStartup.addListener(onStartup)
browser.notifications.onClicked.addListener(
  genClickListener('https://saladict.crimx.com/releases/')
)
if (browser.notifications.onButtonClicked) {
  // Firefox doesn't support
  browser.notifications.onButtonClicked.addListener(
    genClickListener('https://saladict.crimx.com/releases/')
  )
}

browser.commands.onCommand.addListener(onCommand)

const getText = decodeURI

function onCommand(command: string) {
  switch (command) {
    case 'toggle-active':
      updateConfig({
        ...window.appConfig,
        active: !window.appConfig.active
      })
      break
    case 'toggle-instant':
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length <= 0 || tabs[0].id == null) {
          return
        }
        message
          .send<'QUERY_PIN_STATE', boolean>(tabs[0].id, {
            type: 'QUERY_PIN_STATE'
          })
          .then(isPinned => {
            const config = window.appConfig
            const { enable } = config[isPinned ? 'pinMode' : 'mode'].instant

            updateConfig({
              ...config,
              mode: {
                ...config.mode,
                instant: {
                  ...config.mode.instant,
                  enable: !enable
                }
              },
              pinMode: {
                ...config.pinMode,
                instant: {
                  ...config.pinMode.instant,
                  enable: !enable
                }
              }
            })
          })
      })
      break
    case 'open-quick-search':
      BackgroundServer.getInstance().openQSPanel()
      break
    case 'open-google':
      ContextMenus.openGoogle()
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Google',
        label: 'From_Browser_Shortcut'
      })
      break
    case 'open-youdao':
      ContextMenus.openYoudao()
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Youdao',
        label: 'From_Browser_Shortcut'
      })
      break
    case 'open-caiyun':
      ContextMenus.openCaiyunTrs()
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Caiyun',
        label: 'From_Browser_Shortcut'
      })
      break
    case 'open-pdf':
      openPDF()
      reportEvent({
        category: 'PDF_Viewer',
        action: 'Open_PDF_Viewer',
        label: 'From_Browser_Shortcut'
      })
      break
    case 'search-clipboard':
      BackgroundServer.getInstance().searchClipboard()
      break
    case 'next-profile':
    case 'prev-profile':
      {
        const curID = window.activeProfile.id
        const curIndex = window.profileIDList.findIndex(
          ({ id }) => id === curID
        )
        const offset = command === 'next-profile' ? 1 : -1
        const nextIndex =
          curIndex < 0 ? 0 : (curIndex + offset) % window.profileIDList.length

        updateActiveProfileID(window.profileIDList[nextIndex].id).then(
          searchTextBox
        )
      }
      break
    case 'profile-1':
    case 'profile-2':
    case 'profile-3':
    case 'profile-4':
    case 'profile-5':
      {
        const index = +command.slice(-1)
        if (
          index < window.profileIDList.length &&
          window.profileIDList[index].id !== window.activeProfile.id
        ) {
          updateActiveProfileID(window.profileIDList[index].id).then(
            searchTextBox
          )
        }
      }
      break
    case 'add-notebook':
      addNotebook()
      break
  }
}

async function onInstalled({
  reason,
  previousVersion
}: {
  reason: string
  previousVersion?: string
}) {
  window.appConfig = await initConfig()
  window.activeProfile = await initProfiles()

  await storage.local.set(
    mapValues(await storage.local.get(null), (value, key) => {
      if (key.startsWith('dict_')) return null
      if (key === 'lastCheckUpdate') return Date.now()
      return value
    })
  )

  if (reason === 'install') {
    if (
      !(await storage.sync.get('hasInstructionsShown')).hasInstructionsShown
    ) {
      openURL('options.html?menuselected=Privacy&nopanel=true', true)
      if (window.appConfig.langCode.startsWith('zh')) {
        openURL('https://saladict.crimx.com/notice.html')
      } else {
        openURL('https://saladict.crimx.com/en/notice.html')
      }
      storage.sync.set({ hasInstructionsShown: true })
    }
  } else if (reason === 'update') {
    if (!process.env.DEBUG) {
      const curr = await checkUpdate(browser.runtime.getManifest().version)
      // same version as server
      if (curr.data && curr.diff === 0) {
        const { diff, data } = await checkUpdate(previousVersion, curr.data)
        if (data && diff >= 2) {
          setTimeout(() => {
            const isZh = window.appConfig.langCode.startsWith('zh')
            const options = {
              type: 'basic',
              iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
              title: isZh
                ? `沙拉查词已更新到 ${data.version}`
                : `Saladict has updated to ${data.version}`,
              message: data.data
                .map((line, i) => `${i + 1}. ${line}`)
                .join('\n'),
              priority: 2,
              eventTime: Date.now() + 5000
            } as any

            if (!isFirefox) {
              options.buttons = [{ title: isZh ? '查看更新介绍' : 'More Info' }]
              options.silent = true
            }

            browser.notifications.create('sd-install', options)
          }, 5000)
        }
      }
    }
  }

  loadDictPanelToAllTabs()

  // firefox users may want to calibrate manually
  if (!isFirefox && !(await getTitlebarOffset())) {
    const offset = await calibrateTitlebarOffset()
    if (offset) {
      setTitlebarOffset(offset)
    }
  }
}

function onStartup(): void {
  setTimeout(() => {
    // wait for appConfig being loaded
    if (!process.env.DEBUG && window.appConfig.updateCheck) {
      storage.local
        .get<{ lastCheckUpdate: number }>('lastCheckUpdate')
        .then(async ({ lastCheckUpdate }) => {
          const today = Date.now()
          if (!lastCheckUpdate) {
            storage.local.set({ lastCheckUpdate: today })
          } else if (today - lastCheckUpdate > 7 * 24 * 60 * 60 * 1000) {
            storage.local.set({ lastCheckUpdate: today })
            const { data, diff } = await checkUpdate(
              browser.runtime.getManifest().version
            )
            if (data && diff > 0) {
              const options: browser.notifications.CreateNotificationOptions = {
                type: 'basic',
                iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
                title: getText('%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D'),
                message: `${getText('%E5%8F%AF%E6%9B%B4%E6%96%B0%E8%87%B3')}【${
                  data.version
                }】`
              }
              if (!isFirefox) {
                options.buttons = [
                  { title: getText('%E6%9F%A5%E7%9C%8B%E6%9B%B4%E6%96%B0') }
                ]
              }
              browser.notifications.create('sd-update', options)
            }
          }
        })
    }
  }, 1000)

  if (!process.env.DEBUG && isExtTainted) {
    storage.local.get<{ swat: number }>('swat').then(({ swat }) => {
      const today = Date.now()
      if (!swat) {
        storage.local.set({ swat: today })
      } else if (today - swat > 10 * 24 * 60 * 60 * 1000) {
        storage.local.set({ swat: today })
        const options: browser.notifications.CreateNotificationOptions = {
          type: 'basic',
          iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
          title: getText('%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D'),
          message: getText(
            '%E6%AD%A4%E3%80%8C%E6%B2%99%E6%8B%89%E6%9F%A5%E8%' +
              'AF%8D%E3%80%8D%E6%89%A9%E5%B1%95%E5%B7%B2%E8%A2' +
              '%AB%E4%BA%8C%E6%AC%A1%E6%89%93%E5%8C%85%EF%BC%8' +
              'C%E8%AF%B7%E5%9C%A8%E5%AE%98%E6%96%B9%E5%BB%BA%' +
              'E8%AE%AE%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%AE%89%E8' +
              '%A3%85%E3%80%82'
          )
        }
        if (!isFirefox) {
          options.buttons = [
            {
              title: getText(
                '%E6%9F%A5%E7%9C%8B%E5%8F%AF%E9%9D%A0%E7%9A%84%E5%B9%B3%E5%8F%B0'
              )
            }
          ]
        }
        browser.notifications.create('sd-update', options)
      }
    })
  }

  // Chrome fails to inject css via manifest if the page is loaded
  // as "last opened tabs" when browser opens.
  setTimeout(() => {
    loadDictPanelToAllTabs()
  }, 1000)
}

function genClickListener(url: string) {
  return function clickListener(notificationId: string) {
    switch (notificationId) {
      case 'sd-install':
      case 'sd-update':
        openURL(url)
        browser.notifications.getAll().then(notifications => {
          Object.keys(notifications).forEach(id =>
            browser.notifications.clear(id)
          )
        })
        break
    }
  }
}

async function loadDictPanelToAllTabs() {
  ;(await browser.tabs.query({})).forEach(async tab => {
    if (tab.id && tab.url && tab.url.startsWith('http')) {
      try {
        await injectDictPanel(tab)
      } catch (e) {
        console.warn(e)
      }
    }
  })
}

/** Search text box text on active tab */
async function searchTextBox() {
  await timer(10)

  if (await message.send<'SEARCH_TEXT_BOX'>({ type: 'SEARCH_TEXT_BOX' })) {
    return // popup page received
  }

  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })
  if (tabs.length <= 0 || tabs[0].id == null) {
    return
  }
  message.send(tabs[0].id, { type: 'SEARCH_TEXT_BOX' })
}

async function addNotebook() {
  if (
    await message.send<'ADD_NOTEBOOK'>({
      type: 'ADD_NOTEBOOK',
      payload: { popup: true }
    })
  ) {
    return // popup page received
  }

  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })
  if (tabs.length <= 0 || tabs[0].id == null) {
    return
  }
  message.send(tabs[0].id, { type: 'ADD_NOTEBOOK', payload: { popup: false } })
}
