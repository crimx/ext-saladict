import search, { GoogleResult } from '@/components/dictionaries/google/engine'
import { appConfigFactory } from '@/app-config'

const fetchbak = window.fetch

describe('Dict/Google/engine', () => {
  beforeAll(() => {
    const fs = require('fs')
    const response = fs.readFileSync('test/specs/components/dictionaries/google/response/f.txt', 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      text: () => response
    }))
  })

  afterAll(() => {
    window.fetch = fetchbak
  })

  it('should parse result correctly', () => {
    return search('any', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()
        expect(searchResult.result).toBe('不要温柔地进入那个晚安。 愤怒，对光明的消逝愤怒。')
      })
  })
})
