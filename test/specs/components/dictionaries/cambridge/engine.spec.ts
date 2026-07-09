import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/cambridge/engine'
import { getDefaultConfig, AppConfigMutable } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'
import { mockRequest } from './requests.mock'
import { isManualVerificationError } from '@/components/dictionaries/helpers'

let mock: AxiosMockAdapter

describe('Dict/Cambridge/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse result (en) correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result.length).toBeGreaterThanOrEqual(1)

        expect(result.every(x => typeof x.html === 'string')).toBe(true)
      })
    )
  })

  it('should parse result (zhs) correctly', () => {
    const config = getDefaultConfig() as AppConfigMutable
    config.langCode = 'zh-CN'
    return retry(() =>
      search('house', config, getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result.length).toBeGreaterThanOrEqual(1)

        expect(result.every(x => typeof x.html === 'string')).toBe(true)
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

          expect(result.every(x => typeof x.html === 'string')).toBe(true)
        }
      )
    )
  })

  it('should throw manual verification when blocked by human verification', async () => {
    expect.assertions(3)

    try {
      await search('verify', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      })
    } catch (e) {
      expect(isManualVerificationError(e)).toBe(true)
      expect(e.message).toBe('MANUAL_VERIFICATION')
      expect(e.manualVerification).toEqual({
        text: 'verify',
        url: 'https://dictionary.cambridge.org/dictionary/english/verify'
      })
    }
  })
})
