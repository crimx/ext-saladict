import { createContext } from 'react'
import { ConnectableObservable } from 'rxjs'
import { publishReplay } from 'rxjs/operators'
import { ProfileIDList, Profile } from '@/app-config/profiles'
import { AppConfig } from '@/app-config'
import { createConfigStream } from '@/_helpers/config-manager'
import {
  createActiveProfileStream,
  createProfileIDListStream
} from '@/_helpers/profile-manager'

export const config$$ = createConfigStream().pipe(publishReplay(1))
;(config$$ as ConnectableObservable<AppConfig>).connect()

export const profile$$ = createActiveProfileStream().pipe(publishReplay(1))
;(profile$$ as ConnectableObservable<Profile>).connect()

export const profileIDList$$ = createProfileIDListStream().pipe(
  publishReplay(1)
)
;(profileIDList$$ as ConnectableObservable<ProfileIDList>).connect()

export interface GlobalsContext {
  /** Unsaved form? */
  dirty: boolean
  config: AppConfig
  profile: Profile
  profileIDList: ProfileIDList
}

export const GlobalsContext = createContext(
  (null as unknown) as Readonly<GlobalsContext>
)
