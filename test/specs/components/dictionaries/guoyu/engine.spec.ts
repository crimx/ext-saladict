import search from '@/components/dictionaries/guoyu/engine'
import { appConfigFactory } from '@/app-config'

describe('Dict/GuoYu/engine', () => {
  beforeAll(() => {
    window.fetch = jest.fn((url: string) => Promise.resolve({
      ok: true,
      json: () => require('./response/愛.json')
    }))
  })

  it('should parse result correctly', () => {
    return search('any', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.py).toBe('string')
        expect(typeof searchResult.result.t).toBe('string')
        expect(Array.isArray(searchResult.result.h)).toBeTruthy()
        expect(searchResult.result.translation).toBeTruthy()
      })
  })
})
