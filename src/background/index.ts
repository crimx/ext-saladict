import './server'
import './initialization'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import {
  getActiveProfile,
  addActiveProfileListener
} from '@/_helpers/profile-manager'
import { injectAnalytics } from '@/_helpers/analytics'
import { startSyncServiceInterval } from './sync-manager'
import { init as initMenus } from './context-menus'
import { init as initPdf } from './pdf-sniffer'
import { updateBadge, initBadge } from './badge'
import './types'

startSyncServiceInterval()

getConfig().then(async config => {
  window.appConfig = config
  initMenus(config.contextMenus)
  initPdf(config)
  injectAnalytics('/background')

  updateBadge()
  initBadge()

  addConfigListener(({ newConfig }) => {
    window.appConfig = newConfig
    updateBadge()
  })
})

getActiveProfile().then(async profile => {
  window.activeProfile = profile

  addActiveProfileListener(({ newProfile }) => {
    window.activeProfile = newProfile
  })
})
