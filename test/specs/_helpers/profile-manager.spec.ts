import * as profileManagerOrigin from '@/_helpers/profile-manager'
import { getDefaultProfile, Profile, getDefaultProfileID } from '@/app-config/profiles'
import sinon from 'sinon'
import { timer } from '@/_helpers/promise-more'
import { pick } from 'lodash'

function fakeStorageGet (store) {
  browser.storage.sync.get.callsFake(keys => {
    return Promise.resolve(
      keys ? pick(store, Array.isArray(keys) ? keys : [keys]) : store
    )
  })
}

let profileManager: typeof profileManagerOrigin

describe('Profile Manager', () => {
  beforeEach(() => {
    browser.flush()
    browser.storage.sync.set.callsFake(() => Promise.resolve())
    browser.storage.sync.remove.callsFake(() => Promise.resolve())
    jest.resetModules()
    profileManager = require('@/_helpers/profile-manager')
  })

  it('should init with default profile the first time', async () => {
    fakeStorageGet({})

    const profile = await profileManager.initProfiles()
    expect(typeof profile).toBe('object')
    expect(browser.storage.sync.set.calledWith(sinon.match({
      profileIDList: sinon.match.array,
      activeProfileID: sinon.match.string,
    }))).toBeTruthy()
  })

  it('should keep existing profiles when init', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
    })

    const profile = await profileManager.initProfiles()
    expect(profile).toEqual(profile2)
    expect(browser.storage.sync.set.calledWith(sinon.match({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
    }))).toBeTruthy()
    expect(browser.storage.sync.set.calledWith(sinon.match({
      [profile1.id]: profile1,
    }))).toBeTruthy()
    expect(browser.storage.sync.set.calledWith(sinon.match({
      [profile2.id]: profile2,
    }))).toBeTruthy()
  })

  it('should remove detached keys when init', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    const detached1 = getDefaultProfile()
    const detached2 = getDefaultProfile()
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
      [detached1.id]: detached1,
      [detached2.id]: detached2,
    })

    const profile = await profileManager.initProfiles()
    expect(profile).toEqual(profile2)
    expect(browser.storage.sync.set.calledWith(sinon.match({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
    }))).toBeTruthy()
  })

  it('should reset to default profile', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
    })

    await profileManager.resetAllProfiles()
    expect(browser.storage.sync.remove.calledWith(sinon.match([
      profile1.id,
      profile2.id,
      'profileIDList',
      'activeProfileID',
      'configProfileIDs',
      'activeConfigID',
    ]))).toBeTruthy()
    expect(browser.storage.sync.set.calledWith(sinon.match({
      profileIDList: sinon.match.array,
      activeProfileID: sinon.match.string,
    }))).toBeTruthy()
  })

  it('should add profile', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
    })

    const id3 = getDefaultProfileID()
    await profileManager.addProfile(id3)
    expect(browser.storage.sync.set.calledWith({
      profileIDList: [id1, id2, id3],
      [id3.id]: sinon.match.object
    })).toBeTruthy()
  })

  it('should remove profile', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
    })

    await profileManager.removeProfile(profile1.id)
    expect(browser.storage.sync.remove.calledWith(profile1.id)).toBeTruthy()
    expect(browser.storage.sync.set.calledWith({
      profileIDList: [id2],
    })).toBeTruthy()
  })

  it('should get active profile', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
    })

    expect(await profileManager.getActiveProfile()).toBe(profile2)
  })

  it('should update profile ID list', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    await profileManager.updateProfileIDList([id2, id1])
    expect(browser.storage.sync.set.calledWith({
      profileIDList: [id2, id1],
    })).toBeTruthy()
  })

  it('should update active profile ID', async () => {
    const id1 = getDefaultProfileID()
    await profileManager.updateActiveProfileID(id1.id)
    expect(browser.storage.sync.set.calledWith({
      activeProfileID: id1.id,
    })).toBeTruthy()
  })

  it('should update active profile', async () => {
    const profile = getDefaultProfile()
    await profileManager.updateProfile(profile)
    expect(browser.storage.sync.set.calledWith({
      [profile.id]: profile,
    })).toBeTruthy()
  })

  describe('add active profile listener', () => {
    let profile1: Profile
    let profile2: Profile
    let callback: jest.Mock

    beforeEach(async () => {
      const id1 = getDefaultProfileID()
      const id2 = getDefaultProfileID()
      profile1 = getDefaultProfile(id1.id)
      profile2 = getDefaultProfile(id2.id)
      fakeStorageGet({
        profileIDList: [id1, id2],
        activeProfileID: profile2.id,
        [profile1.id]: profile1,
        [profile2.id]: profile2,
      })
      callback = jest.fn()
      await profileManager.addActiveProfileListener(callback)
    })

    it('should add storage event listener', () => {
      expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
    })

    it('should fire if active profile has changed', async () => {
      const newProfile2: Profile = {
        ...profile2,
        mtaAutoUnfold: 'popup',
      }
      browser.storage.onChanged.dispatch({
        [profile2.id]: {
          newValue: newProfile2,
          oldValue: profile2,
        }
      }, 'sync')
      await timer(0)
      expect(callback).toBeCalledWith({
        newProfile: newProfile2,
        oldProfile: profile2,
      })
    })

    it('should not fire if active profile has not changed', async () => {
      browser.storage.onChanged.dispatch({
        [profile1.id]: {
          newValue: {
            ...profile1,
            mtaAutoUnfold: 'popup'
          },
          oldValue: profile1,
        }
      }, 'sync')
      await timer(0)
      expect(callback).toHaveBeenCalledTimes(0)
    })

    it('should fire if active profile ID has changed', async () => {
      browser.storage.onChanged.dispatch({
        activeProfileID: {
          newValue: profile1.id,
        }
      }, 'sync')
      await timer(0)
      expect(callback).toBeCalledWith({
        newProfile: profile1,
      })
    })

    it('should fire if active profile ID has changed (with last ID)', async () => {
      browser.storage.onChanged.dispatch({
        activeProfileID: {
          newValue: profile1.id,
          oldValue: profile2.id,
        }
      }, 'sync')
      await timer(0)
      expect(callback).toBeCalledWith({
        newProfile: profile1,
        oldProfile: profile2,
      })
    })
  })

  it('should create active profile stream', async () => {
    const id1 = getDefaultProfileID()
    const id2 = getDefaultProfileID()
    const profile1 = getDefaultProfile(id1.id)
    const profile2 = getDefaultProfile(id2.id)
    fakeStorageGet({
      profileIDList: [id1, id2],
      activeProfileID: profile2.id,
      [profile1.id]: profile1,
      [profile2.id]: profile2,
    })
    const subscriber = jest.fn()

    profileManager.createActiveProfileStream().subscribe(subscriber)
    await timer(0)
    expect(subscriber).toBeCalledWith(profile2)

    browser.storage.onChanged.dispatch({
      activeProfileID: {
        newValue: profile1.id,
        oldValue: profile2.id,
      }
    }, 'sync')
    await timer(0)
    expect(subscriber).toBeCalledWith(profile1)
  })
})
