import set from 'lodash/set'
import { updateActiveConfig } from '@/_helpers/config-manager'
import { Props } from './typings'

export function updateConfig (
  { config }: Props, fields: { [index: string]: any }
): void {
  if (!fields) { return }

  const path = Object.keys(fields)[0]
  if (!path) {
    if (process.env.DEV_BUILD) {
      console.error('empty field', fields)
    }
    return
  }

  if (process.env.DEV_BUILD) {
    console.log(path, fields[path])
  }

  set(config, path, fields[path])
  updateActiveConfig(config)
}
