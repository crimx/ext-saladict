import { search } from '@/components/dictionaries/eudic/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Eudic/engine', () => {
  beforeAll(() => {
    const entry = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
    const data = fs.readFileSync(path.join(__dirname, 'response/sentences.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      ok: true,
      text: () => url.indexOf('tab-detail') === -1 ? entry : data
    }))
  })

  it('should parse result correctly', () => {
    return search('love', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')
        expect(searchResult.result).toHaveLength(10)
        const item = searchResult.result[0]
        expect(typeof item.chs).toBe('string')
        expect(typeof item.eng).toBe('string')
        expect(typeof item.mp3).toBe('string')
        expect(typeof item.channel).toBe('string')
      })
  })
})
