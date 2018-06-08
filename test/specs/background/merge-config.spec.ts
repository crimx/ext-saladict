import { appConfigFactory, AppConfig, AppConfigMutable } from '@/app-config'
import mergeConfig from '@/app-config/merge-config'
import sinon from 'sinon'

describe('Merge Config', () => {
  it('should init config when there is no previous config', () => {
    expect(mergeConfig(undefined)).toEqual(appConfigFactory())
  })
  it('should merge config version < 6', () => {
    const oldConfig = appConfigFactory() as AppConfigMutable
    // @ts-ignore
    delete oldConfig.version
    oldConfig.dicts.selected = ['bing']
    oldConfig.dicts.all.bing.defaultUnfold = !oldConfig.dicts.all.bing.defaultUnfold
    oldConfig.dicts.all.bing.preferredHeight = 1000

    const config = mergeConfig(oldConfig)

    const defaultStorageObj = { config: appConfigFactory() }
    const expectStorageObj = { config: appConfigFactory() as AppConfigMutable }
    expectStorageObj.config.dicts.selected = ['bing']
    expectStorageObj.config.dicts.all.bing.defaultUnfold = !expectStorageObj.config.dicts.all.bing.defaultUnfold
    expectStorageObj.config.dicts.all.bing.preferredHeight = 1000

  })
  it('should only update config for version 6', () => {
    const userConfig = appConfigFactory()

    const config = mergeConfig(userConfig)

    const expectStorageObj = { config: userConfig }
    expect(config).toEqual(userConfig)
  })
})
