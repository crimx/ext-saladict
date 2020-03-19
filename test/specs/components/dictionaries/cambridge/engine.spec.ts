import { retry } from '../helpers'
import { search } from '@/components/dictionaries/cambridge/engine'
import { getDefaultConfig, AppConfigMutable } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'

const fetchbak = window.fetch

describe('Dict/Cambridge/engine', () => {
  afterAll(() => {
    window.fetch = fetchbak
  })

  it('should parse result (en) correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result.length).toBeGreaterThanOrEqual(1)

        expect(result.every(x => typeof x === 'string')).toBeGreaterThanOrEqual(
          1
        )
      })
    )
  })

  it('should parse result (zhs) correctly', () => {
    return retry(() =>
      search('house', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result.length).toBeGreaterThanOrEqual(1)

        expect(result.every(x => typeof x === 'string')).toBeGreaterThanOrEqual(
          1
        )
      })
    )
  })

  it('should parse result (zht) correctly', () => {
    const config = getDefaultConfig() as AppConfigMutable
    config.langCode = 'zh-TW'
    return retry(() =>
      search('catch', config, getDefaultProfile(), { isPDF: false }).then(
        ({ result, audio }) => {
          expect(audio && typeof audio.uk).toBe('string')
          expect(audio && typeof audio.us).toBe('string')

          expect(result.length).toBeGreaterThanOrEqual(1)

          expect(
            result.every(x => typeof x === 'string')
          ).toBeGreaterThanOrEqual(1)
        }
      )
    )
  })
})
