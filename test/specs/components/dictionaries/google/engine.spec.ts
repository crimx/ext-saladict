import { retry } from '../helpers'
import { search } from '@/components/dictionaries/google/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { isContainEnglish, isContainJapanese, isContainChinese } from '@/_helpers/lang-check'
import fs from 'fs'
import path from 'path'

describe('Dict/Google/engine', () => {
  beforeAll(() => {
    if (!process.env.CI) {
      const homepage = fs.readFileSync(path.join(__dirname, 'response/homepage.html'), 'utf8')
      const translation = fs.readFileSync(path.join(__dirname, 'response/f.txt'), 'utf8')

      window.fetch = jest.fn((url: string) => Promise.resolve({
        ok: true,
        text: () => /translate_a|googleapis\.com/.test(url) ? translation : homepage
      }))
    }
  })

  it('should parse result correctly', () => {
    return retry(() =>
      search('我爱你', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(searchResult => {
          if (process.env.CI) {
            expect(isContainEnglish(searchResult.result.trans.text)).toBeTruthy()
          } else {
            expect(searchResult.result.trans.text).toBe('“当你不需要的时候，这就是你所读到的东西，当你无法帮助它时，它将决定你将会是什么。”\n - 奥斯卡·王尔德\n 成功一夜成名需要很长时间。')
          }
          expect(searchResult.audio).toBeUndefined()
          expect(searchResult.result.id).toBe('google')
          expect(searchResult.result.sl).toBe('auto')
          expect(searchResult.result.tl).toBe('en')
          expect(isContainChinese(searchResult.result.searchText.text)).toBeTruthy()
          expect(typeof searchResult.result.trans.audio).toBe('string')
          expect(typeof searchResult.result.searchText.audio).toBe('string')
        })
    )
  })

  it('should parse result correctly with payload', () => {
    return retry(() =>
      search('I love you', getDefaultConfig(), getDefaultProfile(), { sl: 'en', tl: 'ja', isPDF: false })
        .then(searchResult => {
          expect(searchResult.result.sl).toBe('en')
          expect(searchResult.result.tl).toBe('ja')
          if (process.env.CI) {
            expect(isContainJapanese(searchResult.result.trans.text)).toBeTruthy()
            expect(isContainEnglish(searchResult.result.searchText.text)).toBeTruthy()
          }
        })
    )
  })
})
