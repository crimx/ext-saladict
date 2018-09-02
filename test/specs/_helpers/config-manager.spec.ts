import * as configManagerOrigin from '@/_helpers/config-manager'
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

let configManager: typeof configManagerOrigin

describe('Config Manager', () => {
  beforeEach(() => {
    browser.flush()
    browser.storage.sync.set.callsFake(() => Promise.resolve())
    browser.storage.sync.remove.callsFake(() => Promise.resolve())
    jest.resetModules()
    configManager = require('@/_helpers/config-manager')
  })

  it('should init with default config the first time', async () => {
    fakeStorageGet({})

    const config = await configManager.initConfig()
    expect(config).toMatchObject({ name: expect.stringContaining('default') })
    expect(browser.storage.sync.set.calledWith(sinon.match({
      configProfileIDs: sinon.match.array,
      activeConfigID: sinon.match.string,
    }))).toBeTruthy()
  })

  it('should keep existing configs when init', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
    })

    const config = await configManager.initConfig()
    expect(config).toEqual(config2)
    expect(browser.storage.sync.set.calledWith(sinon.match({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
    }))).toBeTruthy()
    expect(browser.storage.sync.set.calledWith(sinon.match({
      [config1.id]: config1,
    }))).toBeTruthy()
    expect(browser.storage.sync.set.calledWith(sinon.match({
      [config2.id]: config2,
    }))).toBeTruthy()
  })

  it('should remove detached keys when init', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    const detached1 = appConfigFactory()
    const detached2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
      [detached1.id]: detached1,
      [detached2.id]: detached2,
    })

    const config = await configManager.initConfig()
    expect(config).toEqual(config2)
    expect(browser.storage.sync.set.calledWith(sinon.match({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
    }))).toBeTruthy()
    expect(browser.storage.sync.remove.calledWith([
      detached1.id,
      detached2.id,
    ])).toBeTruthy()
  })

  it('should reset to default config', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
    })

    const config = await configManager.resetConfig()
    expect(config).toMatchObject({ name: expect.stringContaining('default') })
    expect(browser.storage.sync.remove.called).toBeTruthy()
    expect(browser.storage.sync.set.calledWith(sinon.match({
      configProfileIDs: sinon.match.array,
      activeConfigID: sinon.match.string,
    }))).toBeTruthy()
  })

  it('should add config', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
    })

    const config3 = appConfigFactory()
    await configManager.addConfig(config3)
    expect(browser.storage.sync.set.calledWith({
      configProfileIDs: [config1.id, config2.id, config3.id],
      [config3.id]: config3
    })).toBeTruthy()
  })

  it('should remove config', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
    })

    await configManager.removeConfig(config1.id)
    expect(browser.storage.sync.remove.calledWith(config1.id)).toBeTruthy()
    expect(browser.storage.sync.set.calledWith({
      configProfileIDs: [config2.id],
    })).toBeTruthy()
  })

  it('should get active config', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
    })

    expect(await configManager.getActiveConfig()).toBe(config2)
  })

  it('should update config ID list', async () => {
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    await configManager.updateConfigIDList([config2.id, config1.id])
    expect(browser.storage.sync.set.calledWith({
      configProfileIDs: [config2.id, config1.id],
    })).toBeTruthy()
  })

  it('should update active config ID', async () => {
    const config1 = appConfigFactory()
    await configManager.updateActiveConfigID(config1.id)
    expect(browser.storage.sync.set.calledWith({
      activeConfigID: config1.id,
    })).toBeTruthy()
  })

  it('should update active config', async () => {
    const config1 = appConfigFactory()
    await configManager.updateActiveConfig(config1)
    expect(browser.storage.sync.set.calledWith({
      [config1.id]: config1,
    })).toBeTruthy()
  })

  describe('add active config listener', () => {
    let config1: AppConfig
    let config2: AppConfig
    let callback: jest.Mock

    beforeEach(async () => {
      config1 = appConfigFactory()
      config2 = appConfigFactory()
      fakeStorageGet({
        configProfileIDs: [config1.id, config2.id],
        activeConfigID: config2.id,
        [config1.id]: config1,
        [config2.id]: config2,
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
        [config2.id]: {
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
        [config1.id]: {
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
          newValue: config1.id,
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
          newValue: config1.id,
          oldValue: config2.id,
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
    const config1 = appConfigFactory()
    const config2 = appConfigFactory()
    fakeStorageGet({
      configProfileIDs: [config1.id, config2.id],
      activeConfigID: config2.id,
      [config1.id]: config1,
      [config2.id]: config2,
    })
    const subscriber = jest.fn()

    configManager.createActiveConfigStream().subscribe(subscriber)
    await timer(0)
    expect(subscriber).toBeCalledWith(config2)

    browser.storage.onChanged.dispatch({
      activeConfigID: {
        newValue: config1.id,
        oldValue: config2.id,
      }
    }, 'sync')
    await timer(0)
    expect(subscriber).toBeCalledWith(config1)
  })
})
