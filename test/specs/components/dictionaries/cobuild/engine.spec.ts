import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/cobuild/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'
import { isManualVerificationError } from '@/components/dictionaries/helpers'

let mock: AxiosMockAdapter

describe('Dict/COBUILD/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    return retry(() =>
      search('love', getDefaultConfig(), profile, { isPDF: false }).then(
        ({ result, audio }) => {
          expect(result).toBeTruthy()

          if (result.type !== 'collins') {
            throw new Error('Expected Collins result')
          }

          expect(audio && audio.uk).toBe('https://example.com/ced.mp3')
          expect(result.sections.map(section => section.type)).toEqual([
            'COBUILD',
            'Collins English Dictionary',
            'Penguin Dictionary',
            'Examples',
            'Retail',
            'Idioms',
            'Collocations'
          ])
          expect(
            result.sections.find(section => section.type === 'Idioms')!.content
          ).toContain('pick holes in something')
          expect(
            result.sections.find(section => section.type === 'Collocations')!
              .content
          ).toContain('pick a favorite')
          expect(
            result.sections.some(section =>
              /definition\.title\.type|Video pronunciation|Word lists|Word usage trends|Translations/.test(
                section.type + section.title
              )
            )
          ).toBe(false)
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
        url: 'https://www.collinsdictionary.com/dictionary/english/verify'
      })
    }
  })
})
