import { search } from '@/components/dictionaries/sogou/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { isContainEnglish, isContainJapanese, isContainChinese } from '@/_helpers/lang-check'

describe('Dict/Sogou/engine', () => {
  it('should parse result correctly', () => {
    if (process.env.CI) {
      return search('我爱你', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(searchResult => {
          expect(isContainEnglish(searchResult.result.trans.text)).toBeTruthy()
          expect(searchResult.audio).toBeUndefined()
          expect(searchResult.result.id).toBe('sogou')
          expect(searchResult.result.sl).toBe('auto')
          expect(searchResult.result.tl).toBe('en')
          expect(isContainChinese(searchResult.result.searchText.text)).toBeTruthy()
          expect(typeof searchResult.result.trans.audio).toBe('string')
          expect(typeof searchResult.result.searchText.audio).toBe('string')
        })
    }
  })

  it('should parse result correctly with payload', () => {
    if (process.env.CI) {
      return search('I love you', getDefaultConfig(), getDefaultProfile(), { sl: 'en', tl: 'ja', isPDF: false })
        .then(searchResult => {
          expect(searchResult.result.sl).toBe('en')
          expect(searchResult.result.tl).toBe('ja')
          if (process.env.CI) {
            expect(isContainJapanese(searchResult.result.trans.text)).toBeTruthy()
            expect(isContainEnglish(searchResult.result.searchText.text)).toBeTruthy()
          }
        })
    }
  })
})
