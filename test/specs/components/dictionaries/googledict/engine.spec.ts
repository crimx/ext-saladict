import { search } from '@/components/dictionaries/googledict/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/GoogleDict/engine', () => {
  it('should parse result correctly', () => {
    if (process.env.CI) {
      return search('love', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(searchResult => {
          expect(typeof searchResult.result.entry).toBe('string')
        })
    }
  })
})
