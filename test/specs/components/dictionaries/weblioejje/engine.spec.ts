import { retry } from '../helpers'
import { search } from '@/components/dictionaries/weblioejje/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Weblioejje/engine', () => {
  ;['love', '愛'].forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      return retry(() =>
        search(text, getDefaultConfig(), getDefaultProfile(), {
          isPDF: false
        }).then(({ result }) => {
          expect(result.length).toBeGreaterThanOrEqual(1)
          for (const { content } of result) {
            expect(typeof content).toBe('string')
            expect(content.length).toBeGreaterThan(1)
          }
        })
      )
    })
  })
})
