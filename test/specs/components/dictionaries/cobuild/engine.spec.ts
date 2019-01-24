import { search } from '@/components/dictionaries/cobuild/engine'
import { getDefaultConfig, AppConfigMutable } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/COBUILD/engine', () => {
  beforeAll(() => {
    const response = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      ok: true,
      text: () => response
    }))
  })

  it('should parse result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.cobuild.options = {
      sentence: 4
    }
    return search('any', getDefaultConfig(), profile, { isPDF: false })
      .then(searchResult => {
        expect(searchResult.audio).toHaveProperty('us', expect.stringContaining('mp3'))
        expect(searchResult.audio).toHaveProperty('uk', expect.stringContaining('mp3'))

        const result = searchResult.result
        expect(typeof result.title).toBe('string')
        expect(typeof result.level).toBe('string')
        expect(typeof result.star).toBe('number')
        expect(result.defs).toHaveLength(4)
        expect(result.prons).toHaveLength(2)
      })
  })
})
