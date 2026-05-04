import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search, AhdictResult } from '@/components/dictionaries/ahdict/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest, mockSearchTexts } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Ahdict/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  mockSearchTexts.forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      return retry(() =>
        search(text, getDefaultConfig(), getDefaultProfile(), {
          isPDF: false
        }).then(({ result, audio }) => {
          expect(audio).toBeUndefined()

          const entries = result as AhdictResult
          expect(entries.length).toBeGreaterThanOrEqual(1)

          const entry = entries[0]
          expect(typeof entry.title).toBe('string')
          expect(entry.title).toBeTruthy()
          expect(entry.meaning.length).toBeGreaterThanOrEqual(1)
          expect(
            entry.meaning.every(meaning => typeof meaning === 'string')
          ).toBe(true)
          expect(Array.isArray(entry.idioms)).toBe(true)
        })
      )
    })
  })
})
