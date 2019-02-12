import { retry } from '../helpers'
import { search } from '@/components/dictionaries/vocabulary/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Vocabulary/engine', () => {
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
        .then(({ result, audio }) => {
          expect(audio).toBeUndefined()
          expect(typeof result.long).toBe('string')
          expect(typeof result.short).toBe('string')
        })
    )
  })
})
