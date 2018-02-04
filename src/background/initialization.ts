import { storage, openURL } from '../_helpers/browser-api'
import checkUpdate from '../_helpers/check-update'
import { AppConfig } from '../app-config'
import { mergeConfig } from './merge-config'
import { init as initMenus } from './context-menus'
import { init as initPdf } from './pdf-sniffer'

browser.runtime.onInstalled.addListener(onInstalled)
browser.runtime.onStartup.addListener(onStartup)
browser.notifications.onClicked.addListener(genClickListener('https://github.com/crimx/crx-saladict/wiki'))
if (browser.notifications.onButtonClicked) {
  // Firefox don't support
  browser.notifications.onButtonClicked.addListener(genClickListener('https://github.com/crimx/crx-saladict/releases'))
}

function onInstalled ({ reason, previousVersion }: { reason: string, previousVersion?: string }): void {
  // merge config on installed
  storage.sync.get('config')
    .then(({ config }: { config: AppConfig }) => {
      if (config && config.dicts) {
        // got previous config
        return mergeConfig(config)
      }
      return Promise.all([storage.local.clear(), storage.sync.clear()])
        .then(() => {
          openURL('https://github.com/crimx/crx-saladict/wiki/Instructions')
          return mergeConfig()
        })
    })
    .then(config => {
      if (reason === 'update') {
        // ignore patch updates
        if (!previousVersion || previousVersion.replace(/[^.]*$/, '') !== browser.runtime.getManifest().version.replace(/[^.]*$/, '')) {
          showNews()
        }
      }
      initMenus(config.contextMenus)
      initPdf(config.pdfSniff)
      storage.local.set({ lastCheckUpdate: Date.now() })
    })
}

function onStartup (): void {
  // check update every month
  Promise.all([storage.local.get('lastCheckUpdate'), storage.sync.get('config')])
    .then(([r1, r2]) => {
      const lastCheckUpdate = r1.lastCheckUpdate as number
      const config = r2.config as AppConfig
      initMenus(config.contextMenus)
      initPdf(config.pdfSniff)
      const today = Date.now()
      if (!lastCheckUpdate || !(today - lastCheckUpdate < 7 * 24 * 60 * 60 * 1000)) {
        checkUpdate().then(({ info, isAvailable }) => {
          storage.local.set({ lastCheckUpdate: today })
          if (isAvailable) {
            browser.notifications.create('update', {
              type: 'basic',
              iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
              title: '沙拉查词',
              message: (`可更新至【${info.tag_name}】`
              ),
              buttons: [{ title: '查看更新' }],
            })
          }
        })
      }
    })
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

function showNews () {
  return fetch('https://api.github.com/repos/crimx/crx-saladict/releases/latest')
    .then(r => r.json())
    .then(data => {
      if (data && data.tag_name) {
        browser.notifications.create('oninstall', {
          type: 'basic',
          iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
          title: `沙拉查词 Saladict【${data.tag_name}】`,
          message: data.body.match(/^\d+\..+/gm).join('\n'),
          buttons: [{ title: '查看更新' }],
        })
      }
    })
}
