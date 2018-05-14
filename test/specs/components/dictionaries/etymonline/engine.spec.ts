import search from '@/components/dictionaries/etymonline/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/Etymonline/engine', () => {
  beforeAll(() => {
    const response = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      text: () => response
    }))
  })

  it('should parse result correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.dicts.all.etymonline.options = {
      resultnum: 4
    }
    return search('any', config)
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
