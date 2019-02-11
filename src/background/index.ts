import server from './server'
import initialization from './initialization'
import { getDefaultConfig } from '@/app-config'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import { injectAnalytics } from '@/_helpers/analytics'
import './types'

browser.browserAction.setBadgeBackgroundColor({ color: '#C0392B' })

getConfig().then(config => {
  window.appConfig = config || getDefaultConfig()
  server()
  initialization()
  browser.browserAction.setBadgeText({ text: window.appConfig.active ? '' : 'off' })

  if (config.analytics) {
    injectAnalytics()
  }
})

addConfigListener(({ newConfig }) => {
  window.appConfig = newConfig
  browser.browserAction.setBadgeText({ text: newConfig.active ? '' : 'off' })
})
