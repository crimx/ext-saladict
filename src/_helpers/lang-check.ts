import memoizeOne from 'memoize-one'

export const testerChinese = /[\u4e00-\u9fa5]/
export const testerEnglish = /[a-zA-Z]/

/** Hiragana & Katakana, no Chinese */
export const testJapanese = /[\u3041-\u3096\u30A0-\u30FF]/

/** Korean Hangul, no Chinese */
export const testKorean = /[\u3131-\u4dff\u9fa6-\uD79D]/

/** French, no English àâäèéêëîïôœùûüÿç */
export const testFrench = /[\u00e0\u00e2\u00e4\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u0153\u00f9\u00fb\u00fc\u00ff\u00e7]/i

/** Deutsch, no English äöüÄÖÜß */
export const testDeutsch = /[\u00E4\u00F6\u00FC\u00C4\u00D6\u00DC\u00df]/i

/** Spanish, no English áéíóúñü¡¿ */
export const testSpanish = /[\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00fc\u00a1\u00bf]/i

/** Languages excpet Chinese and English */
export const testerMinor = /[^\u4e00-\u9fa5a-zA-Z0-9\s\u200b/[\]{}$^*+|?.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

export const testerPunct = /[/[\]{}$^*+|?.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

export const isContainChinese = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testerChinese.source}+$`).test(text)
      : testerChinese.test(text)
  }
)

export const isContainEnglish = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testerEnglish.source}+$`).test(text)
      : testerEnglish.test(text)
  }
)

/** Hiragana & Katakana, no Chinese */
export const isContainJapanese = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testJapanese.source}+$`).test(text)
      : testJapanese.test(text)
  }
)

/** Korean Hangul, no Chinese */
export const isContainKorean = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testKorean.source}+$`).test(text)
      : testKorean.test(text)
  }
)

/** French, no English àâäèéêëîïôœùûüÿç */
export const isContainFrench = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testFrench.source}+$`).test(text)
      : testFrench.test(text)
  }
)

/** Deutsch, no English äöüÄÖÜß */
export const isContainDeutsch = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testDeutsch.source}+$`).test(text)
      : testDeutsch.test(text)
  }
)

/** Spanish, no English áéíóúñü¡¿ */
export const isContainSpanish = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testSpanish.source}+$`).test(text)
      : testSpanish.test(text)
  }
)

/** Languages excpet Chinese and English */
export const isContainMinor = memoizeOne(
  (text: string, matchAll?: boolean): boolean => {
    return matchAll
      ? new RegExp(`^${testerMinor.source}+$`).test(text)
      : testerMinor.test(text)
  }
)

export const countWords = memoizeOne((text: string): number => {
  return (
    text
      .replace(new RegExp(testerPunct, 'g'), ' ')
      .replace(
        new RegExp(
          `${testerChinese.source}|${testJapanese.source}|${testKorean.source}`,
          'g'
        ),
        ' x '
      )
      .match(/\S+/g) || ''
  ).length
})

export interface SupportedLangs {
  chinese: boolean
  english: boolean
  japanese: boolean
  korean: boolean
  french: boolean
  spanish: boolean
  deutsch: boolean
  others: boolean
  matchAll: boolean
}

export const supportedLangs: ReadonlyArray<keyof SupportedLangs> = [
  'chinese',
  'english',
  'japanese',
  'korean',
  'french',
  'spanish',
  'deutsch',
  'others',
  'matchAll'
]

export function checkSupportedLangs(
  langs: SupportedLangs,
  text: string
): boolean {
  if (!text) {
    return false
  }

  const isContainEng = langs.english && isContainEnglish(text)
  if (isContainEng) {
    return true
  }

  const isContainChs = langs.chinese && isContainChinese(text)
  if (isContainChs) {
    return true
  }

  return (
    (langs.japanese && (isContainJapanese(text) || isContainChs)) ||
    (langs.korean && (isContainKorean(text) || isContainChs)) ||
    (langs.french && (isContainFrench(text) || isContainEng)) ||
    (langs.spanish && (isContainSpanish(text) || isContainEng)) ||
    (langs.deutsch && (isContainDeutsch(text) || isContainEng)) ||
    (langs.others &&
      !isContainChinese(text) &&
      !isContainEnglish(text) &&
      !isContainJapanese(text) &&
      !isContainKorean(text) &&
      !isContainFrench(text) &&
      !isContainSpanish(text) &&
      !isContainDeutsch(text))
  )
}
