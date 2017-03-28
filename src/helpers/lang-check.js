export const isContainChinese = function isContainChinese (text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

export const isContainEnglish = function isContainEnglish (text) {
  return /[a-zA-Z]/.test(text)
}

export default {
  isContainChinese,
  isContainEnglish
}
