import { createIntantCaptureStream } from '@/selection/instant-capture'
import getDefaultConfig, { AppConfigMutable } from '@/app-config'

const config = getDefaultConfig() as AppConfigMutable
config.mode.instant.enable = true
config.mode.instant.key = 'ctrl'

createIntantCaptureStream(config).subscribe(console.log)
