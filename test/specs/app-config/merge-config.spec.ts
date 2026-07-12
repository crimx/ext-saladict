import { AppConfigMutable, getDefaultConfig } from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('mergeConfig', () => {
  it('preserves Korean as the configured locale', () => {
    const oldConfig = getDefaultConfig() as AppConfigMutable
    oldConfig.langCode = 'ko'

    expect(mergeConfig(oldConfig).langCode).toBe('ko')
  })

  it('drops unsupported dictionary auth entries and keeps supported credentials', () => {
    const oldConfig = getDefaultConfig() as AppConfigMutable

    oldConfig.dictAuth.baidu.appid = 'appid'
    oldConfig.dictAuth.baidu.key = 'key'
    oldConfig.dictAuth.alibaba.accessKeyId = 'ak'
    oldConfig.dictAuth.alibaba.accessKeySecret = 'sk'
    oldConfig.dictAuth.volc.accessKeyId = 'volc-ak'
    oldConfig.dictAuth.volc.secretAccessKey = 'volc-sk'
    oldConfig.dictAuth.niutrans.apikey = 'niu-key'
    oldConfig.dictAuth.deepl.authKey = 'deepl-key'
    oldConfig.dictAuth.deeplx.apiUrl = 'https://deeplx.example.com'
    oldConfig.dictAuth.deeplx.token = 'deeplx-token'
    ;(oldConfig.dictAuth as any).sogou = {
      token: 'legacy'
    }

    const mergedConfig = mergeConfig(oldConfig)

    expect((mergedConfig.dictAuth as any).sogou).toBeUndefined()
    expect(mergedConfig.dictAuth.baidu).toEqual({
      appid: 'appid',
      key: 'key'
    })
    expect(mergedConfig.dictAuth.alibaba).toEqual({
      accessKeyId: 'ak',
      accessKeySecret: 'sk'
    })
    expect(mergedConfig.dictAuth.volc).toEqual({
      accessKeyId: 'volc-ak',
      secretAccessKey: 'volc-sk'
    })
    expect(mergedConfig.dictAuth.niutrans).toEqual({
      apikey: 'niu-key'
    })
    expect(mergedConfig.dictAuth.deepl).toEqual({
      authKey: 'deepl-key'
    })
    expect(mergedConfig.dictAuth.deeplx).toEqual({
      apiUrl: 'https://deeplx.example.com',
      token: 'deeplx-token'
    })
    expect(Object.keys(mergedConfig.dictAuth).sort()).toEqual([
      'alibaba',
      'baidu',
      'caiyun',
      'deepl',
      'deeplx',
      'niutrans',
      'tencent',
      'volc',
      'youdaotrans'
    ])
  })

  it('keeps new machine translators aligned with default language behavior', () => {
    const profile = getDefaultProfile()

    for (const id of [
      'alibaba',
      'volc',
      'niutrans',
      'deepl',
      'deeplx'
    ] as const) {
      expect(profile.dicts.all[id].options.slInitial).toBe('collapse')
      expect(profile.dicts.all[id].options.tl).toBe('default')
      expect(profile.dicts.all[id].options.tl2).toBe('default')
      expect(profile.dicts.all[id].options_sel.tl).toContain('default')
      expect(profile.dicts.all[id].options_sel.tl2).toContain('default')
    }
  })
})
