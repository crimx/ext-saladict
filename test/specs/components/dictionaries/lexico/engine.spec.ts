import { retry } from '../helpers'
import {
  search,
  LexicoResultLex,
  LexicoResultRelated
} from '@/components/dictionaries/lexico/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Lexico/engine', () => {
  it('should parse lex result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe(
          'string'
        )
        expect(searchResult.audio && typeof searchResult.audio.us).toBe(
          'string'
        )

        const result = searchResult.result as LexicoResultLex
        expect(result.type).toBe('lex')
        expect(typeof result.entry).toBe('string')
      })
    )
  })

  it('should parse related result correctly', () => {
    return retry(() =>
      search('jumblish', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as LexicoResultRelated
        expect(result.type).toBe('related')
        expect(result.list.length).toBeGreaterThan(0)
      })
    )
  })
})
