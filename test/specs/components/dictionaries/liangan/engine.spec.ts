import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search, LiangAnResult } from '@/components/dictionaries/liangan/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import { mockRequest, mockSearchTexts } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/LiangAn/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  mockSearchTexts.forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      const profile = getDefaultProfile() as ProfileMutable
      profile.dicts.all.liangan.options.trans = true

      return retry(() =>
        search(text, getDefaultConfig(), profile, { isPDF: false }).then(
          ({ result, audio }) => {
            expect(audio && audio.py).toBeUndefined()

            const entry = result as LiangAnResult
            expect(entry.t).toBe('愛')
            expect(entry.h && entry.h.length).toBeGreaterThanOrEqual(1)
            expect(entry.h && entry.h[0].p).toBe('ài')
            expect(entry.h && entry.h[0].d.length).toBeGreaterThanOrEqual(1)
            expect(entry.translation && entry.translation.English).toContain(
              'to love'
            )
          }
        )
      )
    })
  })
})
