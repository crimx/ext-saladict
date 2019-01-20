/**
 * Profiles are switchable profiles
 */
import { getDefaultProfile, Profile, genDefaultProfiles } from '@/app-config/profiles'
import { mergeProfile } from '@/app-config/merge-profile'
import { storage } from './browser-api'
import { TranslationFunction } from 'i18next'

import { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import { concat } from 'rxjs/observable/concat'
import { map } from 'rxjs/operators/map'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'

export interface StorageChanged<T> {
  newValue: T,
  oldValue?: T,
}

export interface ProfileChanged {
  newProfile: Profile,
  oldProfile?: Profile,
}

export function getProfileName (name: string, t: TranslationFunction): string {
  // default names
  const match = /^%%_(\S+)_%%$/.exec(name)
  if (match) {
    return t(`profile:${match[1]}`) || name
  }
  return name
}

export async function initProfiles (): Promise<Profile> {
  const {
    configProfileIDs,
    activeConfigID,
  } = await storage.sync.get(['configProfileIDs', 'activeConfigID'])

  let modes: Profile[] = []
  if (configProfileIDs && configProfileIDs.length > 0) {
    // quota bytes limit
    for (let i = 0; i < configProfileIDs.length; i++) {
      const id = configProfileIDs[i]
      const profile = (await storage.sync.get(id))[id]
      modes.push(profile ? mergeProfile(profile) : getDefaultProfile(id))
    }
  } else {
    modes = genDefaultProfiles()
    // old config, replace the default if exist
    const { config } = (await storage.sync.get('config'))
    if (config) {
      modes[0] = mergeProfile(config)
      await storage.sync.remove('config')
    }
  }

  await storage.sync.set({
    configProfileIDs: modes.map(m => m.id),
    activeConfigID: activeConfigID || modes[0].id
  })

  // beware of quota bytes per item exceeds
  for (let i = 0; i < modes.length; i++) {
    await storage.sync.set({ [modes[i].id]: modes[i] })
  }

  return (activeConfigID && modes.find(m => m.id === activeConfigID)) || modes[0]
}

export async function resetAllProfiles () {
  const ids = (await storage.sync.get('configProfileIDs')).configProfileIDs || []
  await storage.sync.remove(['configProfileIDs', 'activeConfigID', ...ids])
  return initProfiles()
}

export async function getProfile (id: string): Promise<Profile | undefined> {
  return (await storage.sync.get(id))[id]
}

/**
 * Update profile
 */
export function updateProfile (profile: Profile): Promise<void> {
  if (process.env.DEV_BUILD) {
    storage.sync.get('configProfileIDs')
      .then(({ configProfileIDs }) => {
        if (!configProfileIDs || -1 === configProfileIDs.indexOf(profile.id)) {
          if (process.env.NODE_ENV === 'production') {
            console.error('Update Config Error: Not exist', profile)
          }
        }
      })
  }
  return storage.sync.set({ [profile.id]: profile })
}

export async function addProfile (profile: Profile): Promise<void> {
  const {
    configProfileIDs
  } = await storage.sync.get<{ configProfileIDs: string[] }>('configProfileIDs')
  if (process.env.DEV_BUILD) {
    if (configProfileIDs.includes(profile.id) ||
       (await storage.sync.get(profile.id))[profile.id]
    ) {
      console.warn('add profile: profile already exists')
    }
  }
  return storage.sync.set({
    configProfileIDs: [...configProfileIDs, profile.id],
    [profile.id]: profile,
  })
}

export async function removeProfile (id: string): Promise<void> {
  const {
    configProfileIDs
  } = await storage.sync.get<{ configProfileIDs: string[] }>('configProfileIDs')
  if (process.env.DEV_BUILD) {
    if (!configProfileIDs.includes(id) ||
       !(await storage.sync.get(id))[id]
    ) {
      console.warn('remove config: config not exists')
    }
  }
  await storage.sync.set({ configProfileIDs: configProfileIDs.filter(x => x !== id) })
  return storage.sync.remove(id)
}

/**
 * Get the profile under the current mode
 */
export async function getActiveProfile (): Promise<Profile> {
  const { activeConfigID } = await storage.sync.get('activeConfigID')
  if (activeConfigID) {
    const profile = await getProfile(activeConfigID)
    if (profile) {
      return profile
    }
  }
  return getDefaultProfile()
}

/**
 * Update the profile under the current mode
 */
export const updateActiveProfile = updateProfile

/**
 * This is mainly for ordering
 */
export async function getProfileIDList (): Promise<string[]> {
  return (await storage.sync.get('configProfileIDs')).configProfileIDs || []
}

/**
 * This is mainly for ordering
 */
export function updateProfileIDList (list: string[]): Promise<void> {
  return storage.sync.set({ configProfileIDs: list })
}

/**
 * Change the current active profile
 */
export async function getActiveProfileID (): Promise<string> {
  return (await storage.sync.get('activeConfigID')).activeConfigID
}

/**
 * Change the current active profile
 */
export function updateActiveProfileID (id: string): Promise<void> {
  if (process.env.DEV_BUILD) {
    storage.sync.get('configProfileIDs')
      .then(({ configProfileIDs }) => {
        if (-1 === configProfileIDs.indexOf(id)) {
          console.error('Update Active Config ID Error: Not exist', id)
        }
      })
  }
  return storage.sync.set({ activeConfigID: id })
}

export function addProfileIDListListener (
  cb: (changes: StorageChanged<string[]>) => any
) {
  storage.sync.addListener('configProfileIDs', ({ configProfileIDs }) => {
    if (configProfileIDs.newValue) {
      cb(configProfileIDs as any)
    }
  })
}

/**
 * Listen storage changes of the current profile
 */
export async function addActiveProfileListener (
  cb: (changes: ProfileChanged) => any
) {
  let gActiveConfigID = (await storage.sync.get('activeConfigID')).activeConfigID

  storage.sync.addListener((changes, area) => {
    if (area !== 'sync') { return }

    if (changes.activeConfigID) {
      const { newValue: newID, oldValue: oldID } = changes.activeConfigID
      if (!newID) { return }
      gActiveConfigID = newID
      if (oldID) {
        storage.sync.get([oldID, newID]).then(obj => {
          if (obj[newID]) {
            cb({ newProfile: obj[newID], oldProfile: obj[oldID] })
          }
        })
      } else {
        storage.sync.get(newID).then(response => {
          const newProfile = response[newID]
          if (newProfile) {
            cb({ newProfile })
          }
        })
      }
      return
    }

    if (changes[gActiveConfigID]) {
      const { newValue, oldValue } = changes[gActiveConfigID]
      if (newValue) {
        cb({ newProfile: newValue, oldProfile: oldValue })
      }
    }
  })
}

/**
 * Get active profile and create a stream listening to profile changing
 */
export function createProfileIDListStream (): Observable<string[]> {
  return concat(
    from(getProfileIDList()),
    fromEventPattern<[StorageChanged<string[]>] | StorageChanged<string[]>>(
      addProfileIDListListener as any
    ).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newValue),
    ),
  )
}

/**
 * Get active profile and create a stream listening to profile changing
 */
export function createActiveProfileStream (): Observable<Profile> {
  return concat(
    from(getActiveProfile()),
    fromEventPattern<[ProfileChanged] | ProfileChanged>(addActiveProfileListener as any).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newProfile),
    ),
  )
}
