import { retry } from '../helpers'
import { search } from '@/components/dictionaries/jukuu/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Jukuu/engine', () => {
  beforeAll(() => {
    if (!process.env.CI) {
      const response = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
      window.fetch = jest.fn((url: string) => Promise.resolve({
        ok: true,
        text: () => response
      }))
    }
  })

  it('should parse result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(searchResult => {
          expect(typeof searchResult.result.lang).toBe('string')
          expect(searchResult.result.sens.length).toBeGreaterThan(0)
          expect(typeof searchResult.result.sens[0].trans).toBe('string')
          expect(searchResult.result.sens[0].trans.length).toBeGreaterThan(0)
        })
    )
  })
})
