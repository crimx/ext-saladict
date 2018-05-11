import search from '@/components/dictionaries/etymonline/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'

jest.mock('@/_helpers/fetch-dom', () => {
  return jest.fn((url: string) => new Promise((resolve, reject) => {
    const fs = require('fs')
    const { JSDOM } = require('jsdom')
    const response = fs.readFileSync(
      'test/specs/components/dictionaries/etymonline/response/love.html',
      'utf8',
    )
    return resolve(new JSDOM(response).window.document)
  }))
})

describe('Dict/Etymonline/engine', () => {
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
