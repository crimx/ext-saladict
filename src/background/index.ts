import './initialization'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import {
  createActiveProfileStream,
  createProfileIDListStream
} from '@/_helpers/profile-manager'
import { reportGA } from '@/_helpers/analytics'
import { message } from '@/_helpers/browser-api'
import { startSyncServiceInterval } from './sync-manager'
import { init as initPdf } from './pdf-sniffer'
import { ContextMenus } from './context-menus'
import { BackgroundServer } from './server'
import { initBadge } from './badge'
import './types'

// init first to recevice self messaging
message.self.initServer()

startSyncServiceInterval()

ContextMenus.init()
BackgroundServer.init()

getConfig().then(async config => {
  window.appConfig = config
  initPdf(config)
  reportGA('/background')
  initBadge()

  addConfigListener(({ newConfig }) => {
    window.appConfig = newConfig
  })
})

createActiveProfileStream().subscribe(profile => {
  window.activeProfile = profile
})

createProfileIDListStream().subscribe(list => {
  window.profileIDList = list
})
