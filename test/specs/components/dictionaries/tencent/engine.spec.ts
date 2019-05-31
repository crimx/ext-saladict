import { retry } from '../helpers'
import { search } from '@/components/dictionaries/tencent/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { isContainEnglish, isContainChinese } from '@/_helpers/lang-check'

describe('Dict/Tencent/engine', () => {
  var fetch = window.fetch
  beforeAll(() => {
    fetch = window.fetch
    window.fetch = (input: string | Request, init: RequestInit = {}) => fetch(
      input, { ...init, headers: { ...(init.headers || {}), Origin: 'https://fanyi.qq.com' } }
    )
  })

  afterAll(() => {
    window.fetch = fetch
  })

  beforeEach(() => {
    browser.storage.local.get.callsFake(() => Promise.resolve({}))
    browser.storage.local.set.callsFake(() => Promise.resolve())
  })

  it('should parse result correctly', () => {
    if (process.env.CI) {
      return retry(() =>
        search('我爱你', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
          .then(searchResult => {
            expect(isContainEnglish(searchResult.result.trans.text)).toBeTruthy()
            expect(searchResult.result.trans.text).toMatch(/love/i)
            expect(searchResult.result.id).toBe('tencent')
            expect(searchResult.result.sl).toBe('zh')
            expect(searchResult.result.tl).toBe('en')
            expect(isContainChinese(searchResult.result.searchText.text)).toBeTruthy()
            expect(typeof searchResult.result.trans.audio).toBe('string')
            expect(typeof searchResult.result.searchText.audio).toBe('string')
          })
      )
    }
  })
})
