import { updateConfig } from '@/_helpers/config-manager'
import { Props } from './typings'
import { updateProfile } from '@/_helpers/profile-manager'

import set from 'lodash/set'
import get from 'lodash/get'

interface FormItemLayout {
  readonly labelCol: { readonly span: number }
  readonly wrapperCol: { readonly span: number }
}

export const formItemLayout: FormItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 8 },
}

export const formItemModalLayout: FormItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 },
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
    const p = path.replace(/#/g, '.')
    console.log(p, fields[path])
    const err = {}
    if (get(props, p, err) === err) {
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
