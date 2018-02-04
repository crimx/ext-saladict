import chsToChz from '../../../src/_helpers/chs-to-chz'

describe('Chs to Chz', () => {
  it('should convert chs to chz', () => {
    expect(chsToChz('龙龟')).toBe('龍龜')
  })
})
