import search, { BingResultLex, BingResultMachine, BingResultRelated } from '@/components/dictionaries/bing/engine'
import { appConfigFactory, DictConfigs, AppConfigMutable } from '@/app-config'

jest.mock('@/_helpers/fetch-dom', () => {
  return jest.fn((url: string) => new Promise((resolve, reject) => {
    const fs = require('fs')
    const path = require('path')
    const { JSDOM } = require('jsdom')
    const { URL } = require('url')
    const response = {
      lex: fs.readFileSync('test/specs/components/dictionaries/bing/response/lex.html'),
      machine: fs.readFileSync('test/specs/components/dictionaries/bing/response/machine.html'),
      related: fs.readFileSync('test/specs/components/dictionaries/bing/response/related.html'),
    }
    const searchURL = new URL(url)
    const searchText = searchURL.searchParams.get('q')
    if (searchText && response[searchText]) {
      return resolve(new JSDOM(response[searchText]).window.document)
    }
    return reject(new Error(`Missing Response file for ${searchText}`))
  }))
})

describe('Dict/Bing/engine', () => {
  it('should parse lex result correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.dicts.all.bing.options = {
      tense: true,
      phsym: true,
      cdef: true,
      related: true,
      sentence: 4
    }
    return search('lex', config)
      .then(searchResult => {
        expect(searchResult.audio).toHaveProperty('us', expect.stringContaining('mp3'))
        expect(searchResult.audio).toHaveProperty('uk', expect.stringContaining('mp3'))

        const result = searchResult.result as BingResultLex
        expect(result.type).toBe('lex')
        expect((result.phsym as any).length).toBeGreaterThan(0)
        expect((result.cdef as any).length).toBeGreaterThan(0)
        expect((result.infs as any).length).toBeGreaterThan(0)
        expect(result.sentences).toHaveLength(4)
      })
  })

  it('should parse machine result correctly', () => {
    return search('machine', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as BingResultMachine
        expect(result.type).toBe('machine')
        expect(typeof result.mt).toBe('string')
        expect(result.mt.length).toBeGreaterThan(0)
      })
  })

  it('should parse related result correctly', () => {
    return search('related', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as BingResultRelated
        expect(result.type).toBe('related')
        expect(result.defs.length).toBeGreaterThan(0)
      })
  })
})

function genBingConfig (source: Partial<DictConfigs['bing']> = {}): DictConfigs['bing'] {
  return {
    ...appConfigFactory().dicts.all['bing'],
    ...source,
  }
}
