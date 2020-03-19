import { retry } from '../helpers'
import { search } from '@/components/dictionaries/vocabulary/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Vocabulary/engine', () => {
  it('should parse result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio).toBeUndefined()
        expect(typeof result.long).toBe('string')
        expect(typeof result.short).toBe('string')
      })
    )
  })
})
