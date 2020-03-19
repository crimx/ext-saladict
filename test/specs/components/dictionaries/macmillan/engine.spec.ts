import { retry } from '../helpers'
import {
  search,
  MacmillanResultLex,
  MacmillanResultRelated
} from '@/components/dictionaries/macmillan/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Macmillan/engine', () => {
  it('should parse lex result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe(
          'string'
        )

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
    )
  })

  it('should parse related result correctly', () => {
    return retry(() =>
      search('jumblish', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as MacmillanResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
    )
  })
})
