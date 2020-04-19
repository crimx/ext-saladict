import { config$$, profile$$ } from '../data'
import { withLatestFrom, switchMap, startWith, share } from 'rxjs/operators'
import { from, Subject } from 'rxjs'
import set from 'lodash/set'
import { updateConfig } from '@/_helpers/config-manager'
import { updateProfile } from '@/_helpers/profile-manager'

const upload$ = new Subject<{ [path: string]: any }>()

export const upload = (values: { [path: string]: any }) => upload$.next(values)

export const uploadResult$$ = upload$.pipe(
  withLatestFrom(config$$, profile$$),
  switchMap(([values, config, profile]) => {
    const data: { config?: typeof config; profile?: typeof profile } = {}

    const paths = Object.keys(values)
    if (process.env.DEBUG) {
      if (paths.length <= 0) {
        console.warn('Saving empty fields.', values)
      }
    }

    for (const path of paths) {
      if (path.startsWith('config.')) {
        if (!data.config) {
          data.config = JSON.parse(JSON.stringify(config))
        }
        set(data, path, values[path])
      } else if (path.startsWith('profile.')) {
        if (!data.profile) {
          data.profile = JSON.parse(JSON.stringify(profile))
        }
        set(data, path, values[path])
      } else {
        console.error(new Error(`Saving unknown path: ${path}`))
      }
    }

    const requests: Promise<void>[] = []

    if (data.config) {
      requests.push(updateConfig(data.config))
    }

    if (data.profile) {
      requests.push(updateProfile(data.profile))
    }

    const pRequests = Promise.all(requests)
      .then(() => ({ loading: false }))
      .catch(error => ({ loading: false, error }))

    if (process.env.DEBUG) {
      console.log('saved setting', data)
    }

    return from(pRequests).pipe(startWith({ loading: true }))
  }),
  share<{ loading: boolean; error?: Error }>()
)
