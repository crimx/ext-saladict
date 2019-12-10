import { retry } from '../helpers'
import { search } from '@/components/dictionaries/guoyu/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/GuoYu/engine', () => {
  it('should parse result correctly', () => {
    return retry(() =>
      search('愛', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.py).toBe(
          'string'
        )
        expect(typeof searchResult.result.t).toBe('string')
        expect(Array.isArray(searchResult.result.h)).toBeTruthy()
        expect(searchResult.result.translation).toBeTruthy()
      })
    )
  })
})
