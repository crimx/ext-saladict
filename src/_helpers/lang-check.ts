export const testerChinese = /[\u4e00-\u9fa5]/
export const testerEnglish = /[a-zA-Z]/

/** Hiragana & Katakana */
export const testJapanese = /[\u3041-\u3096]|[\u30A0-\u30FF]/

/** Korean Hangul */
export const testKorean = /[\u3131-\uD79D]/

/** Languages excpet Chinese and English */
export const testerMinor = /[^\u4e00-\u9fa5a-zA-Z0-9\s\/\[\]\{\}\$\^\*\+\|\?\.\-~!@#%&()_='";:><,。？！，、；：“ ”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

export const testerPunct = /[\s\/\[\]\{\}\$\^\*\+\|\?\.\-~!@#%&()_='";:><,。？！，、；：“ ”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]/

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

/** Languages excpet Chinese and English */
export function isContainMinor (text: string): boolean {
  return testerMinor.test(text)
}
