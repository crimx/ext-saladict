import { retry } from '../helpers'
import { search } from '@/components/dictionaries/urban/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Urban/engine', () => {
  beforeAll(() => {
    if (!process.env.CI) {
      const response = fs.readFileSync(path.join(__dirname, 'response/test.html'), 'utf8')
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
          expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')
          expect(searchResult.result).toHaveLength(4)
          const item = searchResult.result[0]
          expect(typeof item.title).toBe('string')
          expect(typeof item.pron).toBe('string')
          expect(typeof item.meaning).toBe('string')
          expect(typeof item.example).toBe('string')
          expect(item.gif).toBeUndefined()
          expect(Array.isArray(item.tags)).toBeTruthy()
          expect((item.tags as any).length).toBeGreaterThan(0)
          expect(typeof item.contributor).toBe('string')
          expect(typeof item.thumbsUp).toBe('string')
          expect(typeof item.thumbsDown).toBe('string')

          expect(typeof (searchResult.result[1].gif as any).src).toBe('string')
          expect(typeof (searchResult.result[1].gif as any).attr).toBe('string')
        })
    )
  })
})
