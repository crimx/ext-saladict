import { search, MacmillanResultLex, MacmillanResultRelated } from '@/components/dictionaries/macmillan/engine'
import { appConfigFactory } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/Macmillan/engine', () => {
  beforeAll(() => {
    const response = {
      love: fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8'),
      love_2: fs.readFileSync(path.join(__dirname, 'response/love_2.html'), 'utf8'),
      jumblish: fs.readFileSync(path.join(__dirname, 'response/jumblish.html'), 'utf8'),
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
    return search('love', appConfigFactory(), {})
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe('string')

        const result = searchResult.result as MacmillanResultLex
        expect(result.type).toBe('lex')
        expect(result.items).toHaveLength(2)

        result.items.forEach(item => {
          expect(typeof item.title).toBe('string')
          expect(typeof item.senses).toBe('string')
          expect(typeof item.pos).toBe('string')
          expect(typeof item.sc).toBe('string')
          expect(typeof item.phsym).toBe('string')
          expect(typeof item.pron).toBe('string')
          expect(typeof item.ratting).toBe('number')
        })
      })
  })

  it('should parse related result correctly', () => {
    return search('jumblish', appConfigFactory(), {})
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as MacmillanResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
  })
})
