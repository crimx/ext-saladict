import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import {
  search,
  MojidictResult
} from '@/components/dictionaries/mojidict/engine'
import { AppConfigMutable, getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest, mockSearchTexts } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Mojidict/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  mockSearchTexts.forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      const config = getDefaultConfig() as AppConfigMutable
      config.autopron.cn.dict = 'mojidict'

      return retry(() =>
        search(text, config, getDefaultProfile(), { isPDF: false }).then(
          ({ result, audio }) => {
            expect(audio && typeof audio.py).toBe('string')

            const entry = result as MojidictResult
            expect(entry.word).toEqual(
              expect.objectContaining({
                tarId: '198970803',
                spell: '心',
                pron: expect.stringContaining('こころ'),
                tts: expect.stringContaining('mp3')
              })
            )
            expect(
              entry.details && entry.details.length
            ).toBeGreaterThanOrEqual(1)
            expect(entry.details && entry.details[0].title).toBe('名')
            expect(
              entry.details &&
                entry.details[0].subdetails &&
                entry.details[0].subdetails.length
            ).toBeGreaterThanOrEqual(1)
            expect(entry.examples).toHaveLength(3)
            expect(entry.examQuestions).toHaveLength(3)
            expect(
              entry.related && entry.related.length
            ).toBeGreaterThanOrEqual(1)
          }
        )
      )
    })
  })
})
