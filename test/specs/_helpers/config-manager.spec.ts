import * as configManager from '@/_helpers/config-manager'
import { appConfigFactory, AppConfig } from '@/app-config'
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

describe('Config Manager', () => {
  beforeEach(() => {
    browser.flush()
    browser.storage.sync.set.callsFake(() => Promise.resolve())
    browser.storage.sync.remove.callsFake(() => Promise.resolve())
  })

  it('should init with default config the first time', async () => {
    fakeStorageGet({})

    const config = await configManager.initConfig()
    expect(config).toMatchObject({ name: expect.stringContaining('default') })
    expect(browser.storage.sync.set.calledOnceWith(sinon.match({
      configModeIDs: sinon.match.array,
      activeConfigID: sinon.match.string,
    }))).toBeTruthy()
  })

  it('should keep existing configs when init', async () => {
    const config1 = appConfigFactory('id1')
    const config2 = appConfigFactory('id2')
    fakeStorageGet({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    })

    const config = await configManager.initConfig()
    expect(config).toEqual(config2)
    expect(browser.storage.sync.set.calledOnceWith(sinon.match({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    }))).toBeTruthy()
  })

  it('should reset to default config', async () => {
    const config1 = appConfigFactory('id1')
    const config2 = appConfigFactory('id2')
    fakeStorageGet({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    })

    const config = await configManager.resetConfig()
    expect(config).toMatchObject({ name: expect.stringContaining('default') })
    expect(browser.storage.sync.remove.called).toBeTruthy()
    expect(browser.storage.sync.set.calledOnceWith(sinon.match({
      configModeIDs: sinon.match.array,
      activeConfigID: sinon.match.string,
    }))).toBeTruthy()
  })

  it('should add config', async () => {
    const config1 = appConfigFactory('id1')
    const config2 = appConfigFactory('id2')
    fakeStorageGet({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    })

    const config3 = appConfigFactory('id3')
    await configManager.addConfig(config3)
    expect(browser.storage.sync.set.calledWith({
      configModeIDs: ['id1', 'id2', 'id3'],
      id3: config3
    })).toBeTruthy()
  })

  it('should remove config', async () => {
    const config1 = appConfigFactory('id1')
    const config2 = appConfigFactory('id2')
    fakeStorageGet({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    })

    await configManager.removeConfig('id1')
    expect(browser.storage.sync.remove.calledWith('id1')).toBeTruthy()
    expect(browser.storage.sync.set.calledWith({
      configModeIDs: ['id2'],
    })).toBeTruthy()
  })

  it('should get active config', async () => {
    const config1 = appConfigFactory('id1')
    const config2 = appConfigFactory('id2')
    fakeStorageGet({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    })

    expect(await configManager.getActiveConfig()).toBe(config2)
  })

  it('should update config ID list', async () => {
    await configManager.updateConfigIDList(['id2', 'id1'])
    expect(browser.storage.sync.set.calledWith({
      configModeIDs: ['id2', 'id1'],
    })).toBeTruthy()
  })

  it('should update active config ID', async () => {
    await configManager.updateActiveConfigID('id1')
    expect(browser.storage.sync.set.calledWith({
      activeConfigID: 'id1',
    })).toBeTruthy()
  })

  it('should update active config', async () => {
    const config1 = appConfigFactory('id1')
    await configManager.updateActiveConfig(config1)
    expect(browser.storage.sync.set.calledWith({
      id1: config1,
    })).toBeTruthy()
  })

  describe('add active config listener', () => {
    let config1: AppConfig
    let config2: AppConfig
    let callback: jest.Mock

    beforeEach(async () => {
      config1 = appConfigFactory('id1')
      config2 = appConfigFactory('id2')
      fakeStorageGet({
        configModeIDs: ['id1', 'id2'],
        activeConfigID: 'id2',
        id1: config1,
        id2: config2,
      })
      callback = jest.fn()
      await configManager.addActiveConfigListener(callback)
    })

    it('should add storage event listener', () => {
      expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
    })

    it('should fire if active config has changed', async () => {
      const newConfig2 = { ...config2, name: 'changed name', active: !config2.active }
      browser.storage.onChanged.dispatch({
        id2: {
          newValue: newConfig2,
          oldValue: config2,
        }
      }, 'sync')
      await timer(0)
      expect(callback).toBeCalledWith({
        newConfig: newConfig2,
        oldConfig: config2,
      })
    })

    it('should not fire if active config has not changed', async () => {
      browser.storage.onChanged.dispatch({
        id1: {
          newValue: { ...config1, name: 'changed name', active: !config1.active },
          oldValue: config1,
        }
      }, 'sync')
      await timer(0)
      expect(callback).toHaveBeenCalledTimes(0)
    })

    it('should fire if active config ID has changed', async () => {
      browser.storage.onChanged.dispatch({
        activeConfigID: {
          newValue: 'id1',
        }
      }, 'sync')
      await timer(0)
      expect(callback).toBeCalledWith({
        newConfig: config1,
      })
    })

    it('should fire if active config ID has changed (with last ID)', async () => {
      browser.storage.onChanged.dispatch({
        activeConfigID: {
          newValue: 'id1',
          oldValue: 'id2',
        }
      }, 'sync')
      await timer(0)
      expect(callback).toBeCalledWith({
        newConfig: config1,
        oldConfig: config2,
      })
    })
  })

  it('should create active config stream', async () => {
    const config1 = appConfigFactory('id1')
    const config2 = appConfigFactory('id2')
    fakeStorageGet({
      configModeIDs: ['id1', 'id2'],
      activeConfigID: 'id2',
      id1: config1,
      id2: config2,
    })
    const subscriber = jest.fn()

    configManager.createActiveConfigStream().subscribe(subscriber)
    await timer(0)
    expect(subscriber).toBeCalledWith(config2)

    browser.storage.onChanged.dispatch({
      activeConfigID: {
        newValue: 'id1',
        oldValue: 'id2',
      }
    }, 'sync')
    await timer(0)
    expect(subscriber).toBeCalledWith(config1)
  })
})
