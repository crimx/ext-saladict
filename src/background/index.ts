import './server'
import './initialization'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { getActiveProfile, addActiveProfileListener } from '@/_helpers/profile-manager'
import { injectAnalytics } from '@/_helpers/analytics'
import { startSyncServiceInterval } from './sync-manager'
import { init as initMenus } from './context-menus'
import { init as initPdf } from './pdf-sniffer'
import './types'

browser.browserAction.setBadgeBackgroundColor({ color: '#C0392B' })

startSyncServiceInterval()

getConfig().then(async config => {
  window.appConfig = config
  initMenus(config.contextMenus)
  initPdf(config)
  injectAnalytics()

  browser.browserAction.setBadgeText({ text: window.appConfig.active ? '' : 'off' })

  addConfigListener(({ newConfig }) => {
    window.appConfig = newConfig
    browser.browserAction.setBadgeText({ text: newConfig.active ? '' : 'off' })
  })
})

getActiveProfile().then(async profile => {
  window.activeProfile = profile

  addActiveProfileListener(({ newProfile }) => {
    window.activeProfile = newProfile
  })
})
