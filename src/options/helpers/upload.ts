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
    const data = { config, profile }
    let configChanged = false
    let profileChanged = false

    const paths = Object.keys(values)
    if (process.env.NODE_ENV !== 'production') {
      if (paths.length <= 0) {
        console.warn('Saving empty fields.', values)
      }
    }

    for (const path of paths) {
      if (path.startsWith('config.')) {
        configChanged = true
        set(data, path, values[path])
      } else if (path.startsWith('profile.')) {
        profileChanged = true
        set(data, path, values[path])
      } else {
        console.error(new Error(`Saving unknown path: ${path}`))
      }
    }

    const requests: Promise<void>[] = []

    if (configChanged) {
      requests.push(updateConfig(config))
    }

    if (profileChanged) {
      requests.push(updateProfile(profile))
    }

    const pRequests = Promise.all(requests)
      .then(() => ({ loading: false }))
      .catch(error => ({ loading: false, error }))

    return from(pRequests).pipe(startWith({ loading: true }))
  }),
  share<{ loading: boolean; error?: Error }>()
)
