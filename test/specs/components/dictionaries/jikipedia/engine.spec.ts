import { retry } from '../helpers'
import { search } from '@/components/dictionaries/jikipedia/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Jikipedia/engine', () => {
  it('should parse result correctly', () => {
    return retry(() =>
      search('xswl', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(typeof searchResult.result.length).toBeGreaterThan(0)
        expect(searchResult.result[0].title).toBe('string')
        expect(searchResult.result[0].content).toBe('string')
      })
    )
  })
})
