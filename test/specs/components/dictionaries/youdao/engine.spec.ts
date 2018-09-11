import search, { YoudaoResultLex, YoudaoResultRelated } from '@/components/dictionaries/youdao/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/Youdao/engine', () => {
  beforeAll(() => {
    const response = {
      love: fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8'),
      jumblish: fs.readFileSync(path.join(__dirname, 'response/jumblish.html'), 'utf8'),
      translation: fs.readFileSync(path.join(__dirname, 'response/translation.html'), 'utf8'),
    }

    window.fetch = jest.fn((url: string) => {
      const key = Object.keys(response).find(keyword => url.endsWith(keyword))
      if (key) {
        return Promise.resolve({
          ok: true,
          text: () => response[key]
        })
      }
      return Promise.reject(new Error(`Missing Response file for ${url}`))
    })
  })

  it('should parse lex result correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    return search('love', config)
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe('string')
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')

        const result = searchResult.result as YoudaoResultLex
        expect(result.type).toBe('lex')
        expect(result.stars).toBe(5)
        expect(result.prons).toHaveLength(2)
        expect(typeof result.title).toBe('string')
        expect(result.title).toBeTruthy()
        expect(typeof result.rank).toBe('string')
        expect(result.rank).toBeTruthy()
        expect(typeof result.pattern).toBe('string')
        expect(result.pattern).toBeTruthy()
        expect(typeof result.basic).toBe('string')
        expect(result.basic).toBeTruthy()
        expect(typeof result.collins).toBe('string')
        expect(result.collins).toBeTruthy()
        expect(typeof result.discrimination).toBe('string')
        expect(result.discrimination).toBeTruthy()
        expect(typeof result.sentence).toBe('string')
        expect(result.sentence).toBeTruthy()
        expect(result.translation).toBeFalsy()
      })
  })

  it('should parse lex result correctly when options are changed', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.dicts.all.youdao.options = {
      basic: false,
      collins: false,
      discrimination: false,
      sentence: false,
      translation: false,
      related: false,
    }
    return search('love', config)
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe('string')
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')

        const result = searchResult.result as YoudaoResultLex
        expect(result.type).toBe('lex')
        expect(result.stars).toBe(5)
        expect(result.prons).toHaveLength(2)
        expect(typeof result.title).toBe('string')
        expect(result.title).toBeTruthy()
        expect(typeof result.rank).toBe('string')
        expect(result.rank).toBeTruthy()
        expect(typeof result.pattern).toBe('string')
        expect(result.pattern).toBeTruthy()
        expect(result.basic).toBeFalsy()
        expect(result.collins).toBeFalsy()
        expect(result.discrimination).toBeFalsy()
        expect(result.sentence).toBeFalsy()
        expect(result.translation).toBeFalsy()
      })
  })

  it('should parse translation result correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    return search('translation', config)
      .then(searchResult => {
        expect(!searchResult.audio || !searchResult.audio.uk).toBeTruthy()
        expect(!searchResult.audio || !searchResult.audio.us).toBeTruthy()

        const result = searchResult.result as YoudaoResultLex
        expect(result.type).toBe('lex')
        expect(result.stars).toBeFalsy()
        expect(result.prons).toHaveLength(0)
        expect(result.title).toBeFalsy()
        expect(result.rank).toBeFalsy()
        expect(result.pattern).toBeFalsy()
        expect(result.basic).toBeFalsy()
        expect(result.collins).toBeFalsy()
        expect(result.discrimination).toBeFalsy()
        expect(result.sentence).toBeFalsy()
        expect(result.translation).toBeTruthy()
        expect(typeof result.translation).toBe('string')
      })
  })

  it('should parse related result correctly', () => {
    return search('jumblish', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as YoudaoResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
  })
})
