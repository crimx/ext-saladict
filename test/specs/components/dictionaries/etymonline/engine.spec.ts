import { retry } from '../helpers'
import { search } from '@/components/dictionaries/etymonline/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'

describe('Dict/Etymonline/engine', () => {
  it('should parse result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.etymonline.options = {
      chart: true,
      resultnum: 4
    }
    return retry(() =>
      search('love', getDefaultConfig(), profile, { isPDF: false }).then(
        searchResult => {
          expect(searchResult.audio).toBeUndefined()

          const result = searchResult.result
          expect(result.length).toBeGreaterThanOrEqual(1)
          expect(typeof result[0].title).toBe('string')
          expect(typeof result[0].href).toBe('string')
          expect(typeof result[0].def).toBe('string')
        }
      )
    )
  })
})
