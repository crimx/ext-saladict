import { updateConfig } from '@/_helpers/config-manager'
import { Props } from './typings'
import { updateProfile } from '@/_helpers/profile-manager'

import set from 'lodash/set'
import get from 'lodash/get'

export const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 8 },
}

export const formItemInlineStyle = {
  display: 'inline-block',
  margin: 0,
}

let updateConfigTimeout: any = null
let updateProfileTimeout: any = null

export function updateConfigOrProfile (
  props: Props, fields: { [index: string]: any }
): void {
  if (!fields) { return }

  const path = Object.keys(fields)[0]
  if (!path) {
    if (process.env.DEV_BUILD) {
      console.error('empty field', fields)
    }
    return
  }

  const key = (path.match(/^(config|profile)#/) || ['', ''])[1]
  if (!key) {
    if (process.env.DEV_BUILD) {
      console.error('invalid field', fields)
    }
    return
  }

  if (process.env.DEV_BUILD) {
    console.log(path, fields[path])
    const err = {}
    if (get(props, path.replace(/#/g, '.'), err) === err) {
      console.error('field not exist', fields)
    }
  }

  // antd form will swallow '.' path, use '#' instead
  set(props, path.replace(/#/g, '.'), fields[path])

  switch (key) {
    case 'config':
      clearTimeout(updateConfigTimeout)
      updateConfigTimeout = setTimeout(() => {
        updateConfig(props.config)
      }, 2000)
      break
    case 'profile':
      clearTimeout(updateProfileTimeout)
      updateProfileTimeout = setTimeout(() => {
        updateProfile(props.profile)
      }, 2000)
      break
    default:
      break
  }
}
