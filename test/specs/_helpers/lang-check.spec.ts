import {
  isContainChinese,
  isContainEnglish,
  checkSupportedLangs,
  SupportedLangs
} from '@/_helpers/lang-check'

describe('Language Check', () => {
  it('isContainChinese should return ture if text contains Chinese', () => {
    expect(isContainChinese('lo你ve.')).toBeTruthy()
  })
  it('isContainChinese should return false if text does not contain Chinese', () => {
    expect(isContainChinese('love.')).toBeFalsy()
  })
  it('isContainEnglish should return ture if text contains English', () => {
    expect(isContainEnglish('lo你ve.')).toBeTruthy()
  })
  it('isContainEnglish should return ture if text does not contain English', () => {
    expect(isContainEnglish('你.')).toBeFalsy()
  })

  describe('Check supported languages', () => {
    function tlHelper(matchAll: boolean) {
      return function tl(
        text: string,
        ...args: Array<Exclude<keyof SupportedLangs, 'matchAll'>>
      ) {
        const langs = args.reduce(
          (result, lang) => {
            result[lang] = true
            return result
          },
          {
            chinese: false,
            english: false,
            japanese: false,
            korean: false,
            french: false,
            spanish: false,
            deutsch: false,
            others: false,
            matchAll
          }
        )
        return checkSupportedLangs(langs, text)
      }
    }

    describe('with matchAll on', () => {
      const tl = tlHelper(true)

      it('should return false with all meaningless characters', () => {
        expect(tl('。「')).toBe(false)
        expect(tl('。「', 'chinese')).toBe(false)
        expect(tl('。「', 'english')).toBe(false)
        expect(tl('。「', 'others')).toBe(false)
        expect(tl('1234')).toBe(false)
        expect(tl('1234', 'chinese')).toBe(false)
        expect(tl('1234', 'others')).toBe(false)
      })

      it('should work with CJK', () => {
        expect(tl('你好', 'chinese')).toBe(true)
        expect(tl('コイル', 'japanese')).toBe(true)
        expect(tl('你好', 'japanese')).toBe(false)

        expect(tl('你好電脳コイル', 'chinese')).toBe(false)
        expect(tl('你好電脳コイル', 'japanese')).toBe(false)
        expect(tl('你好電脳コイル', 'chinese', 'japanese')).toBe(true)

        expect(tl('你好 電脳コイル。', 'chinese', 'japanese')).toBe(false)
        expect(tl('你好電脳コイル。', 'chinese', 'japanese', 'others')).toBe(
          true
        )

        expect(tl('你好 電脳コイル❤️', 'chinese', 'japanese')).toBe(false)
        expect(tl('你好電脳コイル❤️', 'chinese', 'japanese', 'others')).toBe(
          true
        )
      })

      it('should work with Latins', () => {
        expect(tl('Love you', 'english')).toBe(true)
        expect(tl('é', 'french')).toBe(true)
        expect(tl('Love you', 'french')).toBe(false)

        expect(tl('bon appétit', 'english')).toBe(false)
        expect(tl('bon appétit', 'french')).toBe(false)
        expect(tl('bon appétit', 'english', 'french')).toBe(true)

        expect(tl('bon appétit?', 'english', 'french')).toBe(false)
        expect(tl('bon appétit?', 'english', 'french', 'others')).toBe(true)

        expect(tl('bon appétit❤️', 'english', 'french')).toBe(false)
        expect(tl('bon appétit❤️', 'english', 'french', 'others')).toBe(true)
      })
    })

    describe('with matchAll off', () => {
      const tl = tlHelper(false)

      it('should return false with all meaningless characters', () => {
        expect(tl('。「')).toBe(false)
        expect(tl('。「', 'chinese')).toBe(false)
        expect(tl('。「', 'english')).toBe(false)
        expect(tl('。「', 'others')).toBe(false)
        expect(tl('1')).toBe(false)
        expect(tl('1', 'english')).toBe(false)
        expect(tl('1', 'others')).toBe(false)
      })

      it('should work with CJK', () => {
        expect(tl('你好', 'chinese')).toBe(true)
        expect(tl('コイル', 'japanese')).toBe(true)
        expect(tl('你好', 'japanese')).toBe(false)

        expect(tl('你好電脳コイル', 'chinese')).toBe(true)
        expect(tl('你好電脳コイル', 'japanese')).toBe(true)
        expect(tl('你好電脳コイル', 'chinese', 'japanese')).toBe(true)

        expect(tl('你好 電脳コイル。', 'chinese', 'japanese')).toBe(true)
        expect(tl('你好電脳コイル。', 'chinese', 'japanese', 'others')).toBe(
          true
        )

        expect(tl('你好 電脳コイル❤️。', 'chinese', 'japanese')).toBe(true)
        expect(tl('你好電脳コイル❤️。', 'chinese', 'japanese', 'others')).toBe(
          true
        )
        expect(tl('❤️', 'others')).toBe(true)
        expect(tl('你好電脳コイル❤️。', 'others')).toBe(true)
        expect(tl('你好電脳コイル。', 'others')).toBe(false)
      })

      it('should work with Latins', () => {
        expect(tl('Love you', 'english')).toBe(true)
        expect(tl('é', 'french')).toBe(true)
        expect(tl('Love you', 'french')).toBe(false)

        expect(tl('bon appétit', 'english')).toBe(true)
        expect(tl('bon appétit', 'french')).toBe(true)
        expect(tl('bon appétit', 'english', 'french')).toBe(true)

        expect(tl('bon appétit?', 'english', 'french')).toBe(true)
        expect(tl('bon appétit?', 'english', 'french', 'others')).toBe(true)

        expect(tl('❤️', 'english', 'french')).toBe(false)
        expect(tl('❤️', 'others')).toBe(true)
        expect(tl('bon appétit❤️', 'english', 'french')).toBe(true)
        expect(tl('bon appétit❤️', 'english', 'french', 'others')).toBe(true)
      })
    })
  })
})
