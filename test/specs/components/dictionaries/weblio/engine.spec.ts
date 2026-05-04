import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/weblio/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Weblio/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })
  ;['love', '吐く', '当たる'].forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      return retry(() =>
        search(text, getDefaultConfig(), getDefaultProfile(), {
          isPDF: false
        }).then(({ result }) => {
          expect(result.length).toBeGreaterThanOrEqual(1)
          expect(typeof result[0].title).toBe('string')
          expect(typeof result[0].def).toBe('string')
        })
      )
    })
  })
})
