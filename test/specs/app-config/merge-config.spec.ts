import { AppConfigMutable, getDefaultConfig } from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'

describe('mergeConfig', () => {
  it('drops unsupported dictionary auth entries', () => {
    const oldConfig = getDefaultConfig() as AppConfigMutable

    oldConfig.dictAuth.baidu.appid = 'appid'
    oldConfig.dictAuth.baidu.key = 'key'
    ;(oldConfig.dictAuth as any).sogou = {
      token: 'legacy'
    }

    const mergedConfig = mergeConfig(oldConfig)

    expect((mergedConfig.dictAuth as any).sogou).toBeUndefined()
    expect(mergedConfig.dictAuth.baidu).toEqual({
      appid: 'appid',
      key: 'key'
    })
    expect(Object.keys(mergedConfig.dictAuth).sort()).toEqual([
      'baidu',
      'caiyun',
      'tencent',
      'youdaotrans'
    ])
  })
})
