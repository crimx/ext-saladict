import set from 'lodash/set'
import curry from 'lodash/curry'
import { AppConfig } from '@/app-config'
import { updateActiveConfig } from '@/_helpers/config-manager'

export const updateConfig = curry(
  <T = any>(config: AppConfig, path: string, value: T): T => {
    if (process.env.NODE_ENV === 'development') {
      console.log(path, value)
    }
    set(config, path, value)
    updateActiveConfig(config)
    return value
  }
)
