import { createIntantCaptureStream } from '@/selection/instant-capture'
import getDefaultConfig, { AppConfigMutable, AppConfig } from '@/app-config'
import { of } from 'rxjs'

const config = getDefaultConfig() as AppConfigMutable
config.mode.instant.enable = true
config.mode.instant.key = 'ctrl'

createIntantCaptureStream(of(config), of(false), of(false)).subscribe(
  console.log
)
