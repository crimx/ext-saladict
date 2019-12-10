import { retry } from '../helpers'
import {
  search,
  OALDResultLex,
  OALDResultRelated
} from '@/components/dictionaries/oald/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/OALD/engine', () => {
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

        const result = searchResult.result as OALDResultLex
        expect(result.type).toBe('lex')
        expect(result.items).toHaveLength(2)

        result.items.forEach(item => {
          expect(typeof item.title).toBe('string')
          expect(item.title).toBeTruthy()
          expect(typeof item.defs).toBe('string')
          expect(item.defs).toBeTruthy()
          expect(item.prons).toHaveLength(2)
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

        const result = searchResult.result as OALDResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
    )
  })
})
