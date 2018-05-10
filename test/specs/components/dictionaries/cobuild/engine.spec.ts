import search from '@/components/dictionaries/cobuild/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'

jest.mock('@/_helpers/fetch-dom', () => {
  return jest.fn((url: string) => new Promise((resolve, reject) => {
    const fs = require('fs')
    const { JSDOM } = require('jsdom')
    const response = fs.readFileSync('test/specs/components/dictionaries/cobuild/response/love.html', 'utf8')
    return resolve(new JSDOM(response).window.document)
  }))
})

describe('Dict/COBUILD/engine', () => {
  it('should parse result correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.dicts.all.cobuild.options = {
      sentence: 4
    }
    return search('any', config)
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
