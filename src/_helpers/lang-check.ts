export const testerChinese = /[\u4e00-\u9fa5]/
export const testerEnglish = /[a-zA-Z]/
/** Hiragana & Katakana */
export const testJapanese = /[\u3041-\u3096]|[\u30A0-\u30FF]/
/** Korean Hangul */
export const testKorean = /[\u3131-\uD79D]/
export const testerPunct = /^[\s\/\[\]\{\}\$\^\*\+\|\?\.\-~!@#%&()_='";:><,。？！，、；：“ ”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]+$/

export function isContainChinese (text: string): boolean {
  return testerChinese.test(text)
}

export function isContainEnglish (text: string): boolean {
  return testerEnglish.test(text)
}

/** Hiragana & Katakana */
export function isContainJapanese (text: string): boolean {
  return testJapanese.test(text)
}

/** Korean Hangul */
export function isContainKorean (text: string): boolean {
  return testKorean.test(text)
}

export function isAllPunctuation (text: string): boolean {
  return testerPunct.test(text)
}

export default {
  isContainChinese,
  isContainEnglish,
  isAllPunctuation,
}
