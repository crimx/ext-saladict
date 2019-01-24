import { search } from '@/components/dictionaries/etymonline/engine'
import { getDefaultConfig, AppConfigMutable } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Etymonline/engine', () => {
  beforeAll(() => {
    const response = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      ok: true,
      text: () => response
    }))
  })

  it('should parse result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.etymonline.options = {
      chart: true,
      resultnum: 4
    }
    return search('any', getDefaultConfig(), profile, { isPDF: false })
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result
        expect(result).toHaveLength(4)
        expect(typeof result[0].title).toBe('string')
        expect(typeof result[0].href).toBe('string')
        expect(typeof result[0].def).toBe('string')
      })
  })
})
