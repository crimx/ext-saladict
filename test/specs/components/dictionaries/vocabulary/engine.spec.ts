import { search } from '@/components/dictionaries/vocabulary/engine'
import { appConfigFactory } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/Vocabulary/engine', () => {
  beforeAll(() => {
    const response = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      ok: true,
      text: () => response
    }))
  })

  it('should parse result correctly', () => {
    return search('any', appConfigFactory(), { isPDF: false })
      .then(({ result, audio }) => {
        expect(audio).toBeUndefined()
        expect(typeof result.long).toBe('string')
        expect(typeof result.short).toBe('string')
      })
  })
})
