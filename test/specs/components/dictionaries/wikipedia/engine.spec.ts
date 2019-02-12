import { retry } from '../helpers'
import { search } from '@/components/dictionaries/wikipedia/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Wikipedia/engine', () => {
  it('should parse result correctly', () => {
    if (process.env.CI) {
      return retry(() =>
        search('数字', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
          .then(({ result }) => {
            expect(typeof result.title).toBe('string')
            expect(typeof result.content).toBe('string')
          })
      )
    }
  })
})
