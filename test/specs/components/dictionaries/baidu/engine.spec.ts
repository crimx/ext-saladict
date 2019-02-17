import { retry } from '../helpers'
import { search } from '@/components/dictionaries/baidu/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { isContainChinese, isContainEnglish, isContainJapanese } from '@/_helpers/lang-check'

describe('Dict/Baidu/engine', () => {
  it('should parse result correctly', () => {
    if (process.env.CI) {
      return retry(() =>
        search('我爱你', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
          .then(searchResult => {
            expect(searchResult.audio).toBeUndefined()
            expect(isContainChinese(searchResult.result.searchText.text)).toBeTruthy()
            expect(isContainEnglish(searchResult.result.trans.text)).toBeTruthy()
            expect(searchResult.result.trans.text).toMatch(/love/)
            expect(searchResult.result.id).toBe('baidu')
            expect(searchResult.result.sl).toBe('zh')
            expect(searchResult.result.tl).toBe('en')
            expect(typeof searchResult.result.trans.audio).toBe('string')
            expect(typeof searchResult.result.searchText.audio).toBe('string')
          })
      )
    }
  })

  it('should parse result correctly with payload', () => {
    if (process.env.CI) {
      return retry(() =>
        search('I love you', getDefaultConfig(), getDefaultProfile(), { sl: 'en', tl: 'jp', isPDF: false })
          .then(searchResult => {
            expect(searchResult.result.sl).toBe('en')
            expect(searchResult.result.tl).toBe('jp')
            expect(isContainEnglish(searchResult.result.searchText.text)).toBeTruthy()
            expect(isContainJapanese(searchResult.result.trans.text)).toBeTruthy()
          })
      )
    }
  })
})
