import { retry } from '../helpers'
import {
  search,
  WebsterLearnerResultLex
} from '@/components/dictionaries/websterlearner/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/WebsterLearner/engine', () => {
  it('should parse lex result correctly', () => {
    return retry(() =>
      search('house', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.us).toBe(
          'string'
        )

        const result = searchResult.result as WebsterLearnerResultLex
        expect(result.type).toBe('lex')
        expect(result.items).toHaveLength(2)

        expect(typeof result.items[0].title).toBe('string')
        expect(result.items[0].title).toBeTruthy()

        expect(typeof result.items[0].pron).toBe('string')
        expect(result.items[0].pron).toBeTruthy()

        expect(typeof result.items[0].infs).toBe('string')
        expect(result.items[0].infs).toBeTruthy()

        expect(typeof result.items[0].infsPron).toBe('string')
        expect(result.items[0].infsPron).toBeTruthy()

        expect(result.items[0].labels).toBeFalsy()

        expect(typeof result.items[0].senses).toBe('string')
        expect(result.items[0].senses).toBeTruthy()

        expect(result.items[0].arts).toHaveLength(1)

        expect(typeof result.items[0].phrases).toBe('string')
        expect(result.items[0].phrases).toBeTruthy()

        expect(typeof result.items[0].derived).toBe('string')
        expect(result.items[0].derived).toBeTruthy()

        // 2
        expect(typeof result.items[1].title).toBe('string')
        expect(result.items[1].title).toBeTruthy()

        expect(typeof result.items[1].pron).toBe('string')
        expect(result.items[1].pron).toBeTruthy()

        expect(typeof result.items[1].infs).toBe('string')
        expect(result.items[1].infs).toBeTruthy()

        expect(result.items[1].infsPron).toBeFalsy()

        expect(typeof result.items[1].labels).toBe('string')
        expect(result.items[1].labels).toBeTruthy()

        expect(typeof result.items[1].senses).toBe('string')
        expect(result.items[1].senses).toBeTruthy()

        expect(result.items[1].arts).toHaveLength(0)

        expect(result.items[1].phrases).toBeFalsy()

        expect(result.items[1].derived).toBeFalsy()
      })
    )
  })
})
