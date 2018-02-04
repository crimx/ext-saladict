import { appConfigFactory, AppConfig, AppConfigMutable } from '../../../src/app-config'
import mergeConfig from '../../../src/background/merge-config'
import sinon from 'sinon'

describe('Merge Config', () => {
  beforeEach(() => {
    browser.flush()
    browser.storage.sync.set.callsFake(() => Promise.resolve())
  })
  afterAll(() => {
    browser.flush()
  })

  it('should init config when there is no previous config', () => {
    return mergeConfig()
      .then(config => {
        const defaultConfig = appConfigFactory()
        const storageObj = { config: defaultConfig }
        Object.keys(defaultConfig.dicts.all).forEach(id => {
          storageObj[id] = sinon.match.object
        })
        expect(config).toEqual(defaultConfig)
        expect(browser.storage.sync.set.calledWithMatch(storageObj)).toBeTruthy()
      })
  })
  it('should merge config version < 6', () => {
    const oldConfig = appConfigFactory() as AppConfigMutable
    // @ts-ignore
    delete oldConfig.version
    Object.keys(oldConfig.dicts.all).forEach(id => {
      oldConfig.dicts.all[id] = { id }
    })
    oldConfig.dicts.selected = ['bing']

    return mergeConfig(oldConfig)
      .then(config => {
        const defaultStorageObj = { config: appConfigFactory() }
        const expectStorageObj = { config: appConfigFactory() as AppConfigMutable }
        expectStorageObj.config.dicts.selected = ['bing']

        Object.keys(oldConfig.dicts.all).forEach(id => {
          defaultStorageObj[id] = sinon.match.object
          expectStorageObj[id] = sinon.match.object
        })

        expect(config).toEqual(expectStorageObj.config)
        expect(browser.storage.sync.set.calledWithMatch(expectStorageObj)).toBeTruthy()
        expect(browser.storage.sync.set.calledWithMatch(defaultStorageObj)).toBeFalsy()
      })
  })
  it('should only update config for version 6', () => {
    const userConfig = appConfigFactory()

    return mergeConfig(userConfig)
      .then(config => {
        const defaultStorageObj1 = { config: appConfigFactory() }
        const defaultStorageObj2 = { config: userConfig }
        const expectStorageObj = { config: userConfig }

        Object.keys(userConfig.dicts.all).forEach(id => {
          defaultStorageObj1[id] = sinon.match.object
          defaultStorageObj2[id] = sinon.match.object
        })

        expect(config).toEqual(userConfig)
        expect(browser.storage.sync.set.calledWithMatch(expectStorageObj)).toBeTruthy()
        expect(browser.storage.sync.set.calledWithMatch(defaultStorageObj1)).toBeFalsy()
        expect(browser.storage.sync.set.calledWithMatch(defaultStorageObj2)).toBeFalsy()
      })
  })
})
