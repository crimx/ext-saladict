import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/zdic/engine'
import { getDefaultConfig } from '@/app-config'
import getDefaultProfile, { ProfileMutable } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Zdic/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse word result correctly', () => {
    return retry(() =>
      search('爱', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.py).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    )
  })

  it('should parse phrase result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    return retry(() =>
      search('沙拉', getDefaultConfig(), profile, { isPDF: false }).then(
        ({ result, audio }) => {
          expect(audio && typeof audio.py).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        }
      )
    )
  })
})
