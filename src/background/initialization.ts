import { AppConfigMutable } from '@/app-config'
import { message, storage, openURL } from '@/_helpers/browser-api'
import { isExtTainted } from '@/_helpers/integrity'
import checkUpdate from '@/_helpers/check-update'
import { updateConfig, initConfig } from '@/_helpers/config-manager'
import { initProfiles } from '@/_helpers/profile-manager'
import { MsgType, MsgQueryPanelState } from '@/typings/message'
import { openPDF, openGoogle, openYoudao } from './context-menus'
import { openQSPanel } from './server'
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

function onCommand (command: string) {
  switch (command) {
    case 'toggle-active':
      updateConfig({
        ...window.appConfig,
        active: !window.appConfig.active,
      })
      break
    case 'toggle-instant':
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs.length <= 0 || tabs[0].id == null) { return }
        message.send<MsgQueryPanelState, boolean>(
          tabs[0].id as number,
          {
            type: MsgType.QueryPanelState,
            path: 'widget.isPinned',
          }
        ).then(isPinned => {
          const appConfig = window.appConfig as AppConfigMutable
          const isEnable = !appConfig[isPinned ? 'pinMode' : 'mode'].instant.enable
          appConfig.mode.instant.enable = isEnable
          appConfig.pinMode.instant.enable = isEnable
          updateConfig(window.appConfig)
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
  }
}

async function onInstalled ({ reason, previousVersion }: { reason: string, previousVersion?: string }) {
  window.appConfig = await initConfig()
  window.activeProfile = await initProfiles()

  await storage.local.set({ lastCheckUpdate: Date.now() })

  if (reason === 'install') {
    if (!(await storage.sync.get('hasInstructionsShown')).hasInstructionsShown) {
      openURL('https://github.com/crimx/ext-saladict/wiki/Instructions#wiki-content')
      storage.sync.set({ hasInstructionsShown: true })
    }
    (await browser.tabs.query({})).forEach(tab => {
      if (tab.id) {
        browser.tabs.executeScript(tab.id, { file: '/content.js' }).catch(() => {/**/})
        browser.tabs.insertCSS(tab.id, { file: '/content.css' }).catch(() => {/**/})
      }
    })
  } else if (reason === 'update') {
    let data: UpdateData | undefined
    if (!process.env.DEV_BUILD) {
      try {
        const response = await fetch('https://api.github.com/repos/crimx/ext-saladict/releases/latest')
        data = await response.json()
      } catch (e) {/* */}
    }

    if (data) {
      // ignore patch updates
      if ((data.name && data.name.endsWith('#')) ||
          !previousVersion ||
          previousVersion.replace(/[^.]*$/, '') !== browser.runtime.getManifest().version.replace(/[^.]*$/, '')
      ) {
        showNews(data)
      }
    }
  }
}

function onStartup (): void {
  // check update every week
  storage.local.get<{ lastCheckUpdate: number }>('lastCheckUpdate')
    .then(({ lastCheckUpdate }) => {
      const today = Date.now()
      if (!lastCheckUpdate || !(today - lastCheckUpdate < 20 * 24 * 60 * 60 * 1000)) {
        checkUpdate().then(({ info, isAvailable }) => {
          storage.local.set({ lastCheckUpdate: today })
          if (isAvailable) {
            browser.notifications.create('update', {
              type: 'basic',
              iconUrl: browser.runtime.getURL(`static/icon-128.png`),
              title: decodeURI('%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D'),
              message: (`可更新至【${info.tag_name}】`
              ),
              buttons: [{ title: '查看更新' }],
            })
          }
        })
      }

      // anti piracy
      if (!process.env.DEV_BUILD && lastCheckUpdate && isExtTainted) {
        const diff = Math.floor((today - lastCheckUpdate) / 24 / 60 / 60 / 1000)
        if (diff > 0 && diff % 7 === 0) {
          browser.notifications.create('update', {
            type: 'basic',
            iconUrl: browser.runtime.getURL(`static/icon-128.png`),
            title: decodeURI('%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D'),
            message: decodeURI('%E6%AD%A4%E3%80%8C%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D%E3%80%8D%E6%89%A9%E5%B1%95%E5%B7%B2%E8%A2%AB%E4%BA%8C%E6%AC%A1%E6%89%93%E5%8C%85%EF%BC%8C%E8%AF%B7%E5%9C%A8%E5%AE%98%E6%96%B9%E5%BB%BA%E8%AE%AE%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%AE%89%E8%A3%85%E3%80%82'),
            buttons: [{ title: decodeURI('%E6%9F%A5%E7%9C%8B%E5%8F%AF%E9%9D%A0%E7%9A%84%E5%B9%B3%E5%8F%B0') }],
          })
        }
      }
    })

  // Chrome fails to inject css via manifest if the page is loaded
  // as "last opened tabs" when browser opens.
  setTimeout(() => {
    browser.tabs.query({})
      .then(tabs => {
        tabs.forEach(({ id, url }) => {
          if (id && url && url.startsWith('http')) {
            browser.tabs.insertCSS(id, { file: '/content.css' }).catch(() => {/* noop */})
            browser.tabs.executeScript(id, { file: '/content.js' }).catch(() => {/* noop */})
          }
        })
      })
  }, 1000)
}

function genClickListener (url: string) {
  return function clickListener (notificationId: string) {
    if (!/^(oninstall|update)$/.test(notificationId)) { return }
    openURL(url)
    browser.notifications.getAll()
      .then(notifications => {
        Object.keys(notifications).forEach(id => browser.notifications.clear(id))
      })
  }
}

function showNews (data: UpdateData) {
  const message = data.body
    ? (data.body.match(/^\d+\..+/gm) || []) // ordered list
      .map(line => line.replace(/\[(\S+)\](?:\(\S+\)|\[\S+\])/g, '$1')) // strip markdown link
      .join('\n')
    : ''
  if (data.tag_name) {
    browser.notifications.create('oninstall', {
      type: 'basic',
      iconUrl: browser.runtime.getURL(`static/icon-128.png`),
      title: `Saladict ${data.tag_name} 新增特性：`,
      message,
      buttons: [{ title: '查看更新介绍' }],
      eventTime: Date.now() + 10000,
      priority: 2,
    })
  }
}
