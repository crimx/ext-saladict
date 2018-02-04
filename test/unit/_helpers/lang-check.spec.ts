import { isContainChinese, isContainEnglish } from '../../../src/_helpers/lang-check'

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
})
