import { createIntantCaptureStream } from '@/selection/instant-capture'
import getDefaultConfig, { AppConfigMutable, AppConfig } from '@/app-config'
import { Subject } from 'rxjs'

const config = getDefaultConfig() as AppConfigMutable
config.mode.instant.enable = true
config.mode.instant.key = 'ctrl'

const input$$ = new Subject<Readonly<[AppConfig, boolean, boolean]>>()

createIntantCaptureStream(input$$).subscribe(console.log)

input$$.next([config, false, false] as const)
