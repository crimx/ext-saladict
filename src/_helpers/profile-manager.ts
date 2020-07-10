/**
 * Profiles are switchable profiles
 */
import pako from 'pako'
import {
  getDefaultProfile,
  Profile,
  genProfilesStorage,
  ProfileIDList,
  ProfileID
} from '@/app-config/profiles'
import { mergeProfile } from '@/app-config/merge-profile'
import { storage } from './browser-api'
import { TFunction } from 'i18next'

import { Observable, from, concat, fromEventPattern } from 'rxjs'
import { map } from 'rxjs/operators'

export interface StorageChanged<T> {
  newValue: T
  oldValue?: T
}

export interface ProfileChanged {
  newProfile: Profile
  oldProfile?: Profile
}

/** Compressed profile data */
interface ProfileCompressed {
  /** version */
  v: 1
  /** data */
  d: string
}

export function deflate(profile: Profile): ProfileCompressed {
  return {
    v: 1,
    d: pako.deflate(JSON.stringify(profile), { to: 'string' })
  }
}

export function inflate(profile: Profile | ProfileCompressed): Profile
export function inflate(profile: undefined): undefined
export function inflate(
  profile?: Profile | ProfileCompressed
): Profile | undefined
export function inflate(
  profile?: Profile | ProfileCompressed
): Profile | undefined {
  if (profile && profile['v'] === 1) {
    return JSON.parse(
      pako.inflate((profile as ProfileCompressed).d, { to: 'string' })
    )
  }
  return profile as Profile | undefined
}

export function getProfileName(name: string, t: TFunction): string {
  // default names
  const match = /^%%_(\S+)_%%$/.exec(name)
  if (match) {
    return t(`common:profile.${match[1]}`) || name
  }
  return name
}

export async function initProfiles(): Promise<Profile> {
  let profiles: Profile[] = []
  let profileIDList: ProfileIDList = []
  let activeProfileID = ''

  const response = await storage.sync.get<{
    profileIDList: ProfileIDList
    activeProfileID: string
  }>(['profileIDList', 'activeProfileID'])

  if (response.profileIDList) {
    profileIDList = response.profileIDList.filter(item =>
      Boolean(
        item && typeof item.id === 'string' && typeof item.name === 'string'
      )
    )
  }

  if (response.activeProfileID) {
    activeProfileID = response.activeProfileID
  }

  if (profileIDList.length > 0) {
    // quota bytes limit
    for (const { id } of profileIDList) {
      const profile = await getProfile(id)
      profiles.push(profile ? mergeProfile(profile) : getDefaultProfile(id))
    }
  } else {
    ;({ profileIDList, profiles } = genProfilesStorage())
    activeProfileID = profileIDList[0].id
  }

  if (!activeProfileID) {
    activeProfileID = profileIDList[0].id
  }

  let activeProfile = profiles.find(({ id }) => id === activeProfileID)
  if (!activeProfile) {
    activeProfile = profiles[0]
    activeProfileID = activeProfile.id
  }

  await storage.sync.set({ profileIDList, activeProfileID })

  // quota bytes per item limit
  for (const profile of profiles) {
    await updateProfile(profile)
  }

  return activeProfile
}

export async function resetAllProfiles() {
  const { profileIDList } = await storage.sync.get<{
    profileIDList: ProfileIDList
  }>('profileIDList')

  if (profileIDList) {
    await storage.sync.remove([
      ...profileIDList.map(({ id }) => id),
      'profileIDList',
      'activeProfileID',
      // legacy
      'configProfileIDs',
      'activeConfigID'
    ])
  }
  return initProfiles()
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  return inflate((await storage.sync.get(id))[id])
}

/**
 * Update profile
 */
export async function updateProfile(profile: Profile): Promise<void> {
  if (process.env.DEBUG) {
    const profileIDList = await getProfileIDList()
    if (!profileIDList.find(item => item.id === profile.id)) {
      console.error(`Update Profile: profile ${profile.id} does not exist`)
    } else {
      console.log('Savedd Profile', profile)
    }
  }
  return storage.sync.set({ [profile.id]: deflate(profile) })
}

export async function addProfile(profileID: ProfileID): Promise<void> {
  const id = profileID.id
  const profileIDList = await getProfileIDList()
  if (process.env.DEBUG) {
    if (profileIDList.find(item => item.id === id) || (await getProfile(id))) {
      console.warn(`Add profile: profile ${id} exists`)
    }
  }

  return storage.sync.set({
    profileIDList: [...profileIDList, profileID],
    [id]: deflate(getDefaultProfile(id))
  })
}

export async function removeProfile(id: string): Promise<void> {
  const activeProfileID = await getActiveProfileID()
  let profileIDList = await getProfileIDList()
  if (process.env.DEBUG) {
    if (
      !profileIDList.find(item => item.id === id) ||
      !(await getProfile(id))
    ) {
      console.warn(`Remove profile: profile ${id} does not exists`)
    }
  }
  profileIDList = profileIDList.filter(item => item.id !== id)
  if (activeProfileID === id) {
    await updateActiveProfileID(profileIDList[0].id)
  }
  await updateProfileIDList(profileIDList)
  return storage.sync.remove(id)
}

/**
 * Get the profile under the current mode
 */
export async function getActiveProfile(): Promise<Profile> {
  const activeProfileID = await getActiveProfileID()
  if (activeProfileID) {
    const profile = await getProfile(activeProfileID)
    if (profile) {
      return profile
    }
  }
  return getDefaultProfile()
}

export async function getActiveProfileID(): Promise<string> {
  return (await storage.sync.get('activeProfileID')).activeProfileID || ''
}

export function updateActiveProfileID(id: string): Promise<void> {
  return storage.sync.set({ activeProfileID: id })
}

/**
 * This is mainly for ordering
 */
export async function getProfileIDList(): Promise<ProfileIDList> {
  return (await storage.sync.get('profileIDList')).profileIDList || []
}

/**
 * This is mainly for ordering
 */
export function updateProfileIDList(list: ProfileIDList): Promise<void> {
  return storage.sync.set({ profileIDList: list })
}

export function addActiveProfileIDListener(
  cb: (changes: StorageChanged<string>) => any
) {
  storage.sync.addListener('activeProfileID', ({ activeProfileID }) => {
    if (activeProfileID && activeProfileID.newValue) {
      cb(activeProfileID as StorageChanged<string>)
    }
  })
}

export function addProfileIDListListener(
  cb: (changes: StorageChanged<ProfileIDList>) => any
) {
  storage.sync.addListener('profileIDList', ({ profileIDList }) => {
    if (profileIDList && profileIDList.newValue) {
      cb(profileIDList as StorageChanged<ProfileIDList>)
    }
  })
}

/**
 * Listen storage changes of the current profile
 */
export async function addActiveProfileListener(
  cb: (changes: ProfileChanged) => any
) {
  let activeID: string | undefined = await getActiveProfileID()

  storage.sync.addListener(changes => {
    // this id changed
    if (changes.activeProfileID) {
      const { newValue: newID, oldValue: oldID } = (changes as {
        activeProfileID: StorageChanged<string>
      }).activeProfileID
      if (newID) {
        activeID = newID
        if (oldID) {
          storage.sync.get([oldID, newID]).then(obj => {
            if (obj[newID]) {
              cb({
                newProfile: inflate(obj[newID]),
                oldProfile: inflate(obj[oldID])
              })
              return
            }
          })
        } else {
          getProfile(newID).then(newProfile => {
            if (newProfile) {
              cb({ newProfile })
              return
            }
          })
        }
      }
    }

    // the active profile itself updated
    if (activeID && changes[activeID]) {
      const { newValue, oldValue } = changes[activeID] as StorageChanged<
        ProfileCompressed
      >
      if (newValue) {
        cb({ newProfile: inflate(newValue), oldProfile: inflate(oldValue) })
        return
      }
    }
  })
}

/**
 * Get active profile and create a stream listening to profile changing
 */
export function createProfileIDListStream(): Observable<ProfileIDList> {
  return concat(
    from(getProfileIDList()),
    fromEventPattern<
      [StorageChanged<ProfileIDList>] | StorageChanged<ProfileIDList>
    >(addProfileIDListListener as any).pipe(
      map(args => (Array.isArray(args) ? args[0] : args).newValue)
    )
  )
}

/**
 * Get active profile and create a stream listening to profile changing
 */
export function createActiveProfileStream(): Observable<Profile> {
  return concat(
    from(getActiveProfile()),
    fromEventPattern<[ProfileChanged] | ProfileChanged>(
      addActiveProfileListener as any
    ).pipe(map(args => (Array.isArray(args) ? args[0] : args).newProfile))
  )
}
