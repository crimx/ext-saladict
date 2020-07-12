import { BehaviorSubject } from 'rxjs'
import { notification, message as antMsg } from 'antd'
import { TFunction } from 'i18next'
import set from 'lodash/set'
import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { useTranslate } from '@/_helpers/i18n'
import { updateConfig } from '@/_helpers/config-manager'
import { updateProfile } from '@/_helpers/profile-manager'
import { checkBackgroundPermission } from '@/_helpers/permission-manager'
import { useDispatch } from '@/content/redux'
import { setFormDirty } from './use-form-dirty'

export const uploadStatus$ = new BehaviorSubject<
  'idle' | 'uploading' | 'error'
>('idle')

export const useUpload = () => {
  const { t } = useTranslate('options')
  const dispatch = useDispatch()

  return (values: { [stateObjectPaths: string]: any }) =>
    dispatch(async (dispatch, getState) => {
      uploadStatus$.next('uploading')

      const data: { config?: AppConfig; profile?: Profile } = {}
      const paths = Object.keys(values)

      if (process.env.DEBUG) {
        if (paths.length <= 0) {
          console.warn('Saving empty fields.', values)
        }
      }

      for (const path of paths) {
        if (path.startsWith('config.')) {
          if (!data.config) {
            data.config = JSON.parse(JSON.stringify(getState().config))
          }
          set(data, path, values[path])
        } else if (path.startsWith('profile.')) {
          if (!data.profile) {
            data.profile = JSON.parse(JSON.stringify(getState().activeProfile))
          }
          set(data, path, values[path])
        } else {
          console.error(new Error(`Saving unknown path: ${path}`))
        }
      }

      const requests: Promise<void>[] = []

      if (data.config) {
        if (!(await checkOptionalPermissions(data.config, t))) {
          return
        }
        requests.push(updateConfig(data.config))
      }

      if (data.profile) {
        requests.push(updateProfile(data.profile))
      }

      try {
        await Promise.all(requests)
        setFormDirty(false)
        antMsg.destroy()
        antMsg.success(t('msg_updated'))
        uploadStatus$.next('idle')
      } catch (e) {
        notification.error({
          message: t('config.opt.upload_error'),
          description: e.message
        })
        uploadStatus$.next('error')
      }

      if (process.env.DEBUG) {
        console.log('saved setting', data)
      }
    })
}

async function checkOptionalPermissions(
  config: AppConfig,
  t: TFunction
): Promise<boolean> {
  try {
    await checkBackgroundPermission(config)
  } catch (e) {
    console.error(e)
    antMsg.destroy()
    antMsg.error(t('msg_err_permission', { permission: 'background' }))
    return false
  }

  return true
}
