export function isContainChinese (text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text)
}

export function isContainEnglish (text: string): boolean {
  return /[a-zA-Z]/.test(text)
}

export default {
  isContainChinese,
  isContainEnglish
}
