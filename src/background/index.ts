import './env'
import '@/_helpers/axios-worker-adapter'
import './initialization'
import { message } from '@/_helpers/browser-api'
import { startSyncServiceInterval } from './sync-manager'
import { init as initPdf } from './pdf-sniffer'
import { ContextMenus } from './context-menus'
import { BackgroundServer } from './server'
import { initBadge } from './badge'
import { setupCaiyunTrsBackend } from './page-translate/caiyun'
import { setupRequestGAListener } from '@/_helpers/analytics'
import { initBackgroundState } from './state'

// init first to recevice self messaging
message.self.initServer()

startSyncServiceInterval()

ContextMenus.init()
BackgroundServer.init()

setupCaiyunTrsBackend()

setupRequestGAListener()

initBackgroundState()
  .then(({ appConfig }) => {
    initPdf(appConfig)
    initBadge()
  })
  .catch(console.error)
