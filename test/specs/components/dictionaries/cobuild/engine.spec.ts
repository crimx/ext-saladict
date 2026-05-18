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
        searchResult => {
          expect(searchResult.result).toBeTruthy()
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
