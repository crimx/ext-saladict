import memoizeOne from 'memoize-one'

const languages = [
  'chinese',
  'english',
  'japanese',
  'korean',
  'french',
  'spanish',
  'deutsch'
] as const

type Languages = typeof languages[number]

const matchers: { [key in Languages]: RegExp } = {
  chinese: /[\u4e00-\u9fa5]/,
  english: /[a-zA-Z]/,
  /** Hiragana & Katakana, no Chinese */
  japanese: /[\u3041-\u3096\u30A0-\u30FF]/,
  /** Korean Hangul, no Chinese */
  korean: /[\u3131-\u4dff\u9fa6-\uD79D]/,
  /** French, no English àâäèéêëîïôœùûüÿç */
  french: /[\u00e0\u00e2\u00e4\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u0153\u00f9\u00fb\u00fc\u00ff\u00e7]/i,
  /** Spanish, no English áéíóúñü¡¿ */
  spanish: /[\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00fc\u00a1\u00bf]/i,
  /** Deutsch, no English äöüÄÖÜß */
  deutsch: /[\u00E4\u00F6\u00FC\u00C4\u00D6\u00DC\u00df]/i
}

export const isContainChinese = (text: string): boolean =>
  matchers.chinese.test(text)

export const isContainEnglish = (text: string): boolean =>
  matchers.english.test(text)

/** Hiragana & Katakana, no Chinese */
export const isContainJapanese = (text: string): boolean =>
  matchers.japanese.test(text)

/** Korean Hangul, no Chinese */
export const isContainKorean = (text: string): boolean =>
  matchers.korean.test(text)

/** French, no English àâäèéêëîïôœùûüÿç */
export const isContainFrench = (text: string): boolean =>
  matchers.french.test(text)

/** Deutsch, no English äöüÄÖÜß */
export const isContainDeutsch = (text: string): boolean =>
  matchers.deutsch.test(text)

/** Spanish, no English áéíóúñü¡¿ */
export const isContainSpanish = (text: string): boolean =>
  matchers.spanish.test(text)

/** Languages excpet Chinese and English */
export const isContainMinor = memoizeOne((text: string): boolean =>
  matcherMinor.test(text)
)

const isContain: { [key in Languages]: (text: string) => boolean } = {
  chinese: memoizeOne(isContainChinese),
  english: memoizeOne(isContainEnglish),
  /** Hiragana & Katakana, no Chinese */
  japanese: memoizeOne(isContainJapanese),
  /** Korean Hangul, no Chinese */
  korean: memoizeOne(isContainKorean),
  /** French, no English àâäèéêëîïôœùûüÿç */
  french: memoizeOne(isContainFrench),
  /** Spanish, no English áéíóúñü¡¿ */
  spanish: memoizeOne(isContainSpanish),
  /** Deutsch, no English äöüÄÖÜß */
  deutsch: memoizeOne(isContainDeutsch)
}

/** Languages excpet Chinese and English */
const matcherMinor = /[^\u4e00-\u9fa5a-zA-Z0-9\s\u200b/[\]{}$^*+|?.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

const matcherPunct = /[/[\]{}$^*+|?.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

const matcherCJK = new RegExp(
  `${matchers.chinese.source}|${matchers.japanese.source}|${matchers.korean.source}`
)

export const countWords = memoizeOne((text: string): number => {
  return (
    text
      .replace(new RegExp(matcherPunct, 'g'), ' ')
      .replace(new RegExp(matcherCJK, 'g'), ' x ')
      .match(/\S+/g) || ''
  ).length
})

export type SupportedLangs = {
  [key in Languages | 'others' | 'matchAll']: boolean
}

export const supportedLangs: ReadonlyArray<keyof SupportedLangs> = [
  ...languages,
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

  if (langs.matchAll) {
    if (langs.others) {
      return languages.every(l => langs[l] || !isContain[l](text))
    } else {
      const tickedLanguages = languages.filter(l => langs[l])
      if (tickedLanguages.length <= 0) {
        return false
      }
      return new RegExp(
        `^(${tickedLanguages.map(l => matchers[l].source).join('|')})+$`
      ).test(text)
    }
  } /* !langs.matchAll */ else {
    if (languages.some(l => langs[l] && isContain[l](text))) {
      return true
    }
    return langs.others && languages.every(l => !isContain[l](text))
  }
}
