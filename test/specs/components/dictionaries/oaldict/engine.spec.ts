import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search, OaldictResult } from '@/components/dictionaries/oaldict/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest, mockSearchTexts } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Oaldict/engine', () => {
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

          const entry = result as OaldictResult
          expect(typeof entry.title).toBe('string')
          expect(entry.title).toBeTruthy()
          expect(entry.pron.uk.sound || entry.pron.us.sound).toEqual(
            expect.any(String)
          )
          expect(
            entry.senses.length + entry.idioms.length
          ).toBeGreaterThanOrEqual(1)

          const sense = entry.senses[0]
          if (sense) {
            expect(sense.means.length).toBeGreaterThanOrEqual(1)
          }
        })
      )
    })
  })
})
