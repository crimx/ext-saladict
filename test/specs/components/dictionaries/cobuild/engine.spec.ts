import { retry } from '../helpers'
import { search } from '@/components/dictionaries/cobuild/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'

describe('Dict/COBUILD/engine', () => {
  it('should parse result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    return retry(() =>
      search('love', getDefaultConfig(), profile, { isPDF: false }).then(
        searchResult => {
          expect(searchResult.result).toBeTruthy()
        }
      )
    )
  })
})
