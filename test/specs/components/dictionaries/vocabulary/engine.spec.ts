import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/vocabulary/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Vocabulary/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio).toBeUndefined()
        expect(typeof result.long).toBe('string')
        expect(typeof result.short).toBe('string')
      })
    )
  })
})
