import { BackgroundServer } from './server'
import './initialization'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import {
  getActiveProfile,
  addActiveProfileListener
} from '@/_helpers/profile-manager'
import { injectAnalytics } from '@/_helpers/analytics'
import { startSyncServiceInterval } from './sync-manager'
import { ContextMenus } from './context-menus'
import { init as initPdf } from './pdf-sniffer'
import { initBadge } from './badge'
import './types'

startSyncServiceInterval()

ContextMenus.init()
BackgroundServer.init()

getConfig().then(async config => {
  window.appConfig = config
  initPdf(config)
  injectAnalytics('/background')
  initBadge()

  addConfigListener(({ newConfig }) => {
    window.appConfig = newConfig
  })
})

getActiveProfile().then(async profile => {
  window.activeProfile = profile

  addActiveProfileListener(({ newProfile }) => {
    window.activeProfile = newProfile
  })
})
