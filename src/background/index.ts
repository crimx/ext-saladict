import './initialization'
import { getConfig, addConfigListener } from '@/_helpers/config-manager'
import {
  createActiveProfileStream,
  createProfileIDListStream
} from '@/_helpers/profile-manager'
import { reportPaveview } from '@/_helpers/analytics'
import { message } from '@/_helpers/browser-api'
import { startSyncServiceInterval } from './sync-manager'
import { init as initPdf } from './pdf-sniffer'
import { ContextMenus } from './context-menus'
import { BackgroundServer } from './server'
import { initBadge } from './badge'
import { setupCaiyunTrsBackend } from './page-translate/caiyun'
import './types'

// init first to recevice self messaging
message.self.initServer()

startSyncServiceInterval()

ContextMenus.init()
BackgroundServer.init()

setupCaiyunTrsBackend()

getConfig().then(async config => {
  window.appConfig = config
  initPdf(config)
  reportPaveview('/background')
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
