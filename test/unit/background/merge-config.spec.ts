import { appConfigFactory, AppConfig, AppConfigMutable } from '@/app-config'
import mergeConfig from '@/background/merge-config'
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
        expect(config).toEqual(appConfigFactory())
      })
  })
  it('should merge config version < 6', () => {
    const oldConfig = appConfigFactory() as AppConfigMutable
    // @ts-ignore
    delete oldConfig.version
    oldConfig.dicts.selected = ['bing']
    oldConfig.dicts.all.bing.defaultUnfold = !oldConfig.dicts.all.bing.defaultUnfold
    oldConfig.dicts.all.bing.preferredHeight = 1000

    return mergeConfig(oldConfig)
      .then(config => {
        const defaultStorageObj = { config: appConfigFactory() }
        const expectStorageObj = { config: appConfigFactory() as AppConfigMutable }
        expectStorageObj.config.dicts.selected = ['bing']
        expectStorageObj.config.dicts.all.bing.defaultUnfold = !expectStorageObj.config.dicts.all.bing.defaultUnfold
        expectStorageObj.config.dicts.all.bing.preferredHeight = 1000
        expect(config).toEqual(expectStorageObj.config)
      })
  })
  it('should only update config for version 6', () => {
    const userConfig = appConfigFactory()

    return mergeConfig(userConfig)
      .then(config => {
        const expectStorageObj = { config: userConfig }
        expect(config).toEqual(userConfig)
        expect(browser.storage.sync.set.calledWithMatch(expectStorageObj)).toBeTruthy()
      })
  })
})
