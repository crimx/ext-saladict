export const testerChinese = /[\u4e00-\u9fa5]/
export const testerEnglish = /[a-zA-Z]/

/** Hiragana & Katakana, no Chinese */
export const testJapanese = /[\u3041-\u3096\u30A0-\u30FF]/

/** Korean Hangul, no Chinese */
export const testKorean = /[\u3131-\u4dff\u9fa6-\uD79D]/

/** French, no English àâäèéêëîïôœùûüÿç */
export const testFrench = /[\u00e0\u00e2\u00e4\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u0153\u00f9\u00fb\u00fc\u00ff\u00e7]/i

/** Deutsch, no English äöüÄÖÜß */
export const testDeutsch = /\u00E4\u00F6\u00FC\u00C4\u00D6\u00DC\u00df/i

/** Spanish, no English áéíóúñü¡¿ */
export const testSpanish = /\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00fc\u00a1\u00bf/i

/** Languages excpet Chinese and English */
export const testerMinor = /[^\u4e00-\u9fa5a-zA-Z0-9\s\u200b\/\[\]\{\}\$\^\*\+\|\?\.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

export const testerPunct = /[\/\[\]\{\}\$\^\*\+\|\?\.\-~!@#%&()_='";:><,。？！，、；：“”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

export function isContainChinese (text: string): boolean {
  return testerChinese.test(text)
}

export function isContainEnglish (text: string): boolean {
  return testerEnglish.test(text)
}

/** Hiragana & Katakana, no Chinese */
export function isContainJapanese (text: string): boolean {
  return testJapanese.test(text)
}

/** Korean Hangul, no Chinese */
export function isContainKorean (text: string): boolean {
  return testKorean.test(text)
}

/** French, no English àâäèéêëîïôœùûüÿç */
export function isContainFrench (text: string): boolean {
  return testFrench.test(text)
}

/** Deutsch, no English äöüÄÖÜß */
export function isContainDeutsch (text: string): boolean {
  return testDeutsch.test(text)
}

/** Spanish, no English áéíóúñü¡¿ */
export function isContainSpanish (text: string): boolean {
  return testSpanish.test(text)
}

/** Languages excpet Chinese and English */
export function isContainMinor (text: string): boolean {
  return testerMinor.test(text)
}
