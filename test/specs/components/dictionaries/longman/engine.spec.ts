import search, { LongmanResultLex, LongmanResultRelated } from '@/components/dictionaries/longman/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/Longman/engine', () => {
  beforeAll(() => {
    const response = {
      love: fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8'),
      profit: fs.readFileSync(path.join(__dirname, 'response/profit.html'), 'utf8'),
      jumblish: fs.readFileSync(path.join(__dirname, 'response/jumblish.html'), 'utf8'),
    }

    window.fetch = jest.fn((url: string) => {
      const key = Object.keys(response).find(keyword => url.endsWith(keyword))
      if (key) {
        return Promise.resolve({
          text: () => response[key]
        })
      }
      return Promise.reject(new Error(`Missing Response file for ${url}`))
    })
  })

  it('should parse lex result (love) correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.dicts.all.longman.options = {
      wordfams: false,
      collocations: true,
      grammar: true,
      thesaurus: true,
      examples: true,
      bussinessFirst: true,
      related: true,
    }

    return search('love', config)
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe('string')
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')

        const result = searchResult.result as LongmanResultLex
        expect(result.type).toBe('lex')

        expect(result.bussinessFirst).toBe(true)
        expect(result.wordfams).toBeUndefined()
        expect(result.contemporary).toHaveLength(2)
        expect(result.bussiness).toHaveLength(0)

        result.contemporary.forEach(entry => {
          expect(entry.title.HWD.length).toBeGreaterThan(0)
          expect(entry.title.HYPHENATION.length).toBeGreaterThan(0)
          expect(entry.title.HOMNUM.length).toBeGreaterThan(0)
          expect(entry.senses.length).toBeGreaterThan(0)
          expect(typeof entry.phsym).toBe('string')
          expect(typeof entry.pos).toBe('string')
          expect(entry.freq).toHaveLength(2)
          expect(entry.level).toBeDefined()
          expect(entry.level.rate).toBe(3)
          expect(entry.prons).toHaveLength(2)
        })

        expect(typeof result.contemporary[0].grammar).toBe('string')
        expect(typeof result.contemporary[0].thesaurus).toBe('string')
        expect(result.contemporary[0].examples).toHaveLength(3)
        expect(result.contemporary[0].topic).toBeUndefined()

        expect(typeof result.contemporary[0].collocations).toBe('string')
        expect(typeof result.contemporary[0].thesaurus).toBe('string')
        expect(result.contemporary[1].examples).toHaveLength(4)
      })
  })

  it('should parse lex result (profit) correctly', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.dicts.all.longman.options = {
      wordfams: true,
      collocations: true,
      grammar: true,
      thesaurus: true,
      examples: true,
      bussinessFirst: false,
      related: true,
    }

    return search('profit', config)
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe('string')
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')

        const result = searchResult.result as LongmanResultLex
        expect(result.type).toBe('lex')

        expect(result.bussinessFirst).toBe(false)
        expect((result.wordfams as string).length).toBeGreaterThan(0)
        expect(result.contemporary).toHaveLength(2)
        expect(result.bussiness).toHaveLength(2)

        result.contemporary.forEach(entry => {
          expect(entry.title.HWD.length).toBeGreaterThan(0)
          expect(entry.title.HYPHENATION.length).toBeGreaterThan(0)
          expect(entry.title.HOMNUM.length).toBeGreaterThan(0)
          expect(entry.senses.length).toBeGreaterThan(0)
          expect(typeof entry.phsym).toBe('string')
          expect(typeof entry.pos).toBe('string')
          expect(entry.prons).toHaveLength(2)
        })

        result.bussiness.forEach(entry => {
          expect(entry.title.HWD.length).toBeGreaterThan(0)
          expect(entry.title.HYPHENATION.length).toBeGreaterThan(0)
          expect(entry.title.HOMNUM.length).toBeGreaterThan(0)
          expect(entry.senses.length).toBeGreaterThan(0)
          expect(typeof entry.phsym).toBe('string')
          expect(typeof entry.pos).toBe('string')
          expect(entry.freq).toHaveLength(0)
          expect(entry.level).toBeUndefined()
          expect(entry.prons).toHaveLength(0)
        })

        expect(result.contemporary[0].level).toBeDefined()
        expect(result.contemporary[0].level.rate).toBe(3)
        expect(typeof result.contemporary[0].collocations).toBe('string')
        expect(typeof result.contemporary[0].thesaurus).toBe('string')
        expect(result.contemporary[0].freq).toHaveLength(2)
        expect(result.contemporary[0].examples).toHaveLength(2)
        expect(typeof result.contemporary[0].topic).toBeTruthy()

        expect(result.contemporary[1].freq).toHaveLength(0)
        expect(result.contemporary[1].examples).toHaveLength(3)
        expect(result.contemporary[1].level).toBeDefined()
        expect(result.contemporary[1].level.rate).toBe(1)
      })
  })

  it('should parse related result correctly', () => {
    return search('jumblish', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as LongmanResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
  })
})
