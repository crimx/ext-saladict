import { resolveLangCode } from '@/app-config'

describe('resolveLangCode', () => {
  it.each([
    [undefined, 'en'],
    ['en-US', 'en'],
    ['zh-CN', 'zh-CN'],
    ['zh-SG', 'zh-CN'],
    ['zh-TW', 'zh-TW'],
    ['zh-HK', 'zh-TW'],
    ['ko', 'ko'],
    ['ko-KR', 'ko']
  ])('maps %s to %s', (browserLocale, expected) => {
    expect(resolveLangCode(browserLocale)).toBe(expected)
  })
})
