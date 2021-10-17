import { retry } from '../helpers'
import { search } from '@/components/dictionaries/naver/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'

describe('Dict/Naver/engine', () => {
  it('should search zh dict', () => {
    return retry(() =>
      search('爱', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.result.lang).toBe('zh')
        expect(typeof searchResult.result.entry).toBe('object')
      })
    )
  })

  it('should search ja dict', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.naver.options.hanAsJa = true
    return retry(() =>
      search('愛', getDefaultConfig(), profile, { isPDF: false }).then(
        searchResult => {
          expect(searchResult.result.lang).toBe('ja')
          expect(typeof searchResult.result.entry).toBe('object')
        }
      )
    )
  })
})
