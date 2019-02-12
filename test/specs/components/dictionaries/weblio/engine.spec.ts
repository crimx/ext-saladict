import { search } from '@/components/dictionaries/weblio/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Weblio/engine', () => {
  ['love', '吐く', '当たる'].forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      if (process.env.CI) {
        return search(text, getDefaultConfig(), getDefaultProfile(), { isPDF: false })
          .then(({ result }) => {
            expect(result.length).toBeGreaterThanOrEqual(1)
            expect(typeof result[0].title).toBe('string')
            expect(typeof result[0].def).toBe('string')
          })
      }
    })
  })
})
