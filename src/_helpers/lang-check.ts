const testerChinese = /[\u4e00-\u9fa5]/
const testerEnglish = /[a-zA-Z]/

export function isContainChinese (text: string): boolean {
  return testerChinese.test(text)
}

export function isContainEnglish (text: string): boolean {
  return testerEnglish.test(text)
}

export default {
  isContainChinese,
  isContainEnglish
}
