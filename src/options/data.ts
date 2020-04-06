import { ConnectableObservable } from 'rxjs'
import { startWith, publishReplay } from 'rxjs/operators'
import {
  getDefaultProfile,
  ProfileIDList,
  Profile
} from '@/app-config/profiles'
import { getDefaultConfig, AppConfig } from '@/app-config'
import { createConfigStream } from '@/_helpers/config-manager'
import {
  createActiveProfileStream,
  createProfileIDListStream
} from '@/_helpers/profile-manager'

export const config$$ = createConfigStream().pipe(
  startWith(getDefaultConfig()),
  publishReplay(1)
)
;(config$$ as ConnectableObservable<AppConfig>).connect()

export const profile$$ = createActiveProfileStream().pipe(
  startWith(getDefaultProfile()),
  publishReplay(1)
)
;(profile$$ as ConnectableObservable<Profile>).connect()

export const profileIDList$$ = createProfileIDListStream().pipe(
  startWith<ProfileIDList>([]),
  publishReplay(1)
)
;(profileIDList$$ as ConnectableObservable<ProfileIDList>).connect()
