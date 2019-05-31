import { retry } from '../helpers'
import { search } from '@/components/dictionaries/zdic/engine'
import { getDefaultConfig } from '@/app-config'
import getDefaultProfile, { ProfileMutable } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Zdic/engine', () => {
  beforeAll(() => {
    // if (!process.env.CI) {
    // CI cannot access Zdic's server
    const word = fs.readFileSync(path.join(__dirname, 'response/爱.html'), 'utf8')
    const phrase = fs.readFileSync(path.join(__dirname, 'response/沙拉.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      ok: true,
      text: () => url.indexOf('爱') !== -1 ? word : phrase
    }))
    // }
  })

  it('should parse word result correctly', () => {
    return retry(() =>
      search('爱', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(({ result, audio }) => {
          expect(audio && typeof audio.py).toBeUndefined()
          expect(result.length).toBeGreaterThan(0)
        })
    )
  })

  it('should parse phrase result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.zdic.options.audio = true
    return retry(() =>
      search('沙拉', getDefaultConfig(), profile, { isPDF: false })
        .then(({ result, audio }) => {
          expect(audio && typeof audio.py).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        })
    )
  })
})
