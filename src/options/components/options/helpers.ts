import { updateConfig } from '@/_helpers/config-manager'
import { Props } from './typings'
import { updateProfile } from '@/_helpers/profile-manager'

import set from 'lodash/set'
import get from 'lodash/get'

import { message } from 'antd'

interface FormItemLayout {
  readonly labelCol: { readonly span: number }
  readonly wrapperCol: { readonly span: number }
}

export const formItemLayout: FormItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 8 }
}

export const formSubItemLayout: FormItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 }
}

export const formItemModalLayout: FormItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 }
}

let updateConfigTimeout: any = null
let updateProfileTimeout: any = null

export interface FormItemField {
  dirty: boolean
  name: string
  touched: boolean
  value: any
  validating?: boolean
  errors?: {
    field: string
    message: string
  }
}

export function updateConfigOrProfile(
  props: Props,
  fields: { [index: string]: FormItemField }
): void {
  if (!fields) {
    return
  }

  const path = Object.keys(fields)[0]
  if (!path) {
    if (process.env.DEV_BUILD) {
      console.error('empty field', fields)
    }
    return
  }

  const field = fields[path]

  if (!field || field.dirty || field.validating || field.errors) {
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
    console.log(p, field.value)
    const err = {}
    if (get(props, p, err) === err) {
      console.error('field not exist', fields)
    }
  }

  // antd form will swallow '.' path, use '#' instead
  set(props, path.replace(/#/g, '.'), field.value)

  const delay = typeof field.value === 'number' ? 2000 : 1000

  switch (key) {
    case 'config':
      clearTimeout(updateConfigTimeout)
      updateConfigTimeout = setTimeout(() => {
        updateConfig(props.config).catch(() =>
          message.error(props.t('msg_update_error'))
        )
      }, delay)
      break
    case 'profile':
      clearTimeout(updateProfileTimeout)
      updateProfileTimeout = setTimeout(() => {
        updateProfile(props.profile).catch(() =>
          message.error(props.t('msg_update_error'))
        )
      }, delay)
      break
    default:
      break
  }
}

/**
 * Changes the contents of an array by moving an element to a different position
 */
export function arrayMove<T extends any[]>(
  arr: T,
  from: number,
  to: number
): T {
  arr.splice(to < 0 ? arr.length + to : to, 0, arr.splice(from, 1)[0])
  return arr
}
