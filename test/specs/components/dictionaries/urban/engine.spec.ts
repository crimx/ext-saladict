import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/urban/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Urban/engine', () => {
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
      }).then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.us).toBe(
          'string'
        )
        expect(searchResult.result.length).toBeGreaterThan(0)
        const item = searchResult.result[0]
        expect(typeof item.title).toBe('string')
        expect(typeof item.pron).toBe('string')
        expect(typeof item.meaning).toBe('string')
        expect(typeof item.example).toBe('string')
        expect(typeof item.contributor).toBe('string')
        expect(typeof item.thumbsUp).toBe('number')
        expect(typeof item.thumbsDown).toBe('number')
      })
    )
  })
})
