import { appConfigFactory, AppConfig, AppConfigMutable } from '@/app-config'
import mergeConfig from '@/app-config/merge-config'
import sinon from 'sinon'

describe('Merge Config', () => {
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
})
