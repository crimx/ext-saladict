import mapValues from 'lodash/mapValues'
import { message, storage, openURL } from '@/_helpers/browser-api'
import { isExtTainted } from '@/_helpers/integrity'
import checkUpdate from '@/_helpers/check-update'
import { updateConfig, initConfig } from '@/_helpers/config-manager'
import { initProfiles } from '@/_helpers/profile-manager'
import { injectDictPanel } from '@/_helpers/injectSaladictInternal'
import { openPDF, openGoogle, openYoudao } from './context-menus'
import { openQSPanel, searchClipboard } from './server'
import './types'

interface UpdateData {
  name?: string
  body?: string
  tag_name?: string
}

browser.runtime.onInstalled.addListener(onInstalled)
browser.runtime.onStartup.addListener(onStartup)
browser.notifications.onClicked.addListener(
  genClickListener('https://github.com/crimx/ext-saladict/releases')
)
if (browser.notifications.onButtonClicked) {
  // Firefox doesn't support
  browser.notifications.onButtonClicked.addListener(
    genClickListener('https://github.com/crimx/ext-saladict/releases')
  )
}

browser.commands.onCommand.addListener(onCommand)

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
          .send<'QUERY_PANEL_STATE', boolean>(tabs[0].id, {
            type: 'QUERY_PANEL_STATE',
            payload: 'widget.isPinned'
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
      openQSPanel()
      break
    case 'open-google':
      openGoogle()
      break
    case 'open-youdao':
      openYoudao()
      break
    case 'open-pdf':
      openPDF()
      break
    case 'search-clipboard':
      searchClipboard()
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
      openURL('https://saladict.crimx.com/notice/')
      storage.sync.set({ hasInstructionsShown: true })
    }
  } else if (reason === 'update') {
    let data: UpdateData | undefined
    if (!process.env.DEV_BUILD) {
      try {
        const response = await fetch(
          'https://api.github.com/repos/crimx/ext-saladict/releases/latest'
        )
        data = await response.json()
      } catch (e) {
        /* */
      }
    }

    if (data) {
      if ((data.name && data.name.endsWith('#')) || !previousVersion) {
        showNews(data)
      } else if (previousVersion) {
        // ignore patch updates
        const prev = previousVersion.split('.')
        const curr = browser.runtime.getManifest().version.split('.')
        if (
          +prev[0] < +curr[0] ||
          (prev[0] === curr[0] && +prev[1] < +curr[1])
        ) {
          showNews(data)
        }
      }
    }
  }

  loadDictPanelToAllTabs()
}

function onStartup(): void {
  // check update every week
  storage.local
    .get<{ lastCheckUpdate: number }>('lastCheckUpdate')
    .then(({ lastCheckUpdate }) => {
      const today = Date.now()
      if (
        !lastCheckUpdate ||
        !(today - lastCheckUpdate < 20 * 24 * 60 * 60 * 1000)
      ) {
        checkUpdate().then(({ info, isAvailable }) => {
          storage.local.set({ lastCheckUpdate: today })
          if (isAvailable) {
            const options: browser.notifications.CreateNotificationOptions = {
              type: 'basic',
              iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
              title: decodeURI('%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D'),
              message: `可更新至【${info.tag_name}】`
            }

            if (!navigator.userAgent.includes('Firefox')) {
              options.buttons = [{ title: '查看更新' }]
            }

            browser.notifications.create('update', options)
          }
        })
      }

      // anti piracy
      if (!process.env.DEV_BUILD && lastCheckUpdate && isExtTainted) {
        const diff = Math.floor((today - lastCheckUpdate) / 24 / 60 / 60 / 1000)
        if (diff > 0 && diff % 7 === 0) {
          const options: browser.notifications.CreateNotificationOptions = {
            type: 'basic',
            iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
            title: decodeURI('%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D'),
            message: decodeURI(
              '%E6%AD%A4%E3%80%8C%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D%E3%80%8D%E6%89%A9%E5%B1%95%E5%B7%B2%E8%A2%AB%E4%BA%8C%E6%AC%A1%E6%89%93%E5%8C%85%EF%BC%8C%E8%AF%B7%E5%9C%A8%E5%AE%98%E6%96%B9%E5%BB%BA%E8%AE%AE%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%AE%89%E8%A3%85%E3%80%82'
            )
          }

          if (!navigator.userAgent.includes('Firefox')) {
            options.buttons = [
              {
                title: decodeURI(
                  '%E6%9F%A5%E7%9C%8B%E5%8F%AF%E9%9D%A0%E7%9A%84%E5%B9%B3%E5%8F%B0'
                )
              }
            ]
          }

          browser.notifications.create('update', options)
        }
      }
    })

  // Chrome fails to inject css via manifest if the page is loaded
  // as "last opened tabs" when browser opens.
  setTimeout(() => {
    loadDictPanelToAllTabs()
  }, 1000)
}

function genClickListener(url: string) {
  return function clickListener(notificationId: string) {
    if (!/^(oninstall|update)$/.test(notificationId)) {
      return
    }
    openURL(url)
    browser.notifications.getAll().then(notifications => {
      Object.keys(notifications).forEach(id => browser.notifications.clear(id))
    })
  }
}

function showNews(data: UpdateData) {
  setTimeout(() => {
    const isZh = window.appConfig.langCode.startsWith('zh')
    const lineMatcher = isZh ? /^\d+\..+/gm : /^ {3}.+/gm
    const message = data.body
      ? (data.body.match(lineMatcher) || []) // ordered list
          .map(
            (line, i) =>
              `${i + 1}. ` +
              line.slice(3).replace(/\[(.+)\](?:\(\S+\)|\[\S+\])/g, '$1') // strip markdown link
          )
          .join('\n')
      : ''
    if (data.tag_name) {
      const options = {
        type: 'basic',
        iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
        title: isZh
          ? `沙拉查词已更新到 ${data.tag_name}`
          : `Saladict has updated to ${data.tag_name}`,
        message,
        priority: 2
      } as any

      if (window.navigator.userAgent.includes('Firefox')) {
        options.eventTime = Date.now() + 10000
      } else {
        options.buttons = [{ title: isZh ? '查看更新介绍' : 'More Info' }]
        options.requireInteraction = true
        options.silent = true
      }

      browser.notifications.create('oninstall', options)
    }
  }, 5000)
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
