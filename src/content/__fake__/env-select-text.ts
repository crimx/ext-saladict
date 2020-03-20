import { createSelectTextStream } from '@/selection/select-text'
import getDefaultConfig from '@/app-config'

const config = getDefaultConfig()

createSelectTextStream(config).subscribe(console.log)
