export const testerChinese = /[\u4e00-\u9fa5]/
export const testerEnglish = /[a-zA-Z]/
export const testerPunct = /^[\s\/\[\]\{\}\$\^\*\+\|\?\.\-~!@#%&()_='";:><,。？！，、；：“ ”﹃﹄「」﹁﹂‘’『』（）—［］〔〕【】…－～·‧《》〈〉﹏＿]+$/

export function isContainChinese (text: string): boolean {
  return testerChinese.test(text)
}

export function isContainEnglish (text: string): boolean {
  return testerEnglish.test(text)
}

export function isAllPunctuation (text: string): boolean {
  return testerPunct.test(text)
}

export default {
  isContainChinese,
  isContainEnglish,
  isAllPunctuation,
}
