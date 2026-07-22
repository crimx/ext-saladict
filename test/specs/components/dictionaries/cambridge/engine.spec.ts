import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import {
  inlineEntryImages,
  search
} from '@/components/dictionaries/cambridge/engine'
import { getDefaultConfig, AppConfigMutable } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'
import { mockRequest } from './requests.mock'
import {
  getInnerHTML,
  isManualVerificationError
} from '@/components/dictionaries/helpers'

let mock: AxiosMockAdapter

describe('Dict/Cambridge/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse result (en) correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result.length).toBeGreaterThanOrEqual(1)

        expect(result.every(x => typeof x.html === 'string')).toBe(true)
      })
    )
  })

  it('should parse result (zhs) correctly', () => {
    const config = getDefaultConfig() as AppConfigMutable
    config.langCode = 'zh-CN'
    return retry(() =>
      search('house', config, getDefaultProfile(), {
        isPDF: false
      }).then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result.length).toBeGreaterThanOrEqual(1)

        expect(result.every(x => typeof x.html === 'string')).toBe(true)
      })
    )
  })

  it('should parse result (zht) correctly', () => {
    const config = getDefaultConfig() as AppConfigMutable
    config.langCode = 'zh-TW'
    return retry(() =>
      search('catch', config, getDefaultProfile(), { isPDF: false }).then(
        ({ result, audio }) => {
          expect(audio && typeof audio.uk).toBe('string')
          expect(audio && typeof audio.us).toBe('string')

          expect(result.length).toBeGreaterThanOrEqual(1)

          expect(result.every(x => typeof x.html === 'string')).toBe(true)
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
        url: 'https://dictionary.cambridge.org/dictionary/english/verify'
      })
    }
  })

  it('should replace entry images with base64 data URLs', async () => {
    document.body.innerHTML = `
      <section>
        <div class="dimg">
          <img
            src="https://dictionary.cambridge.org/images/thumb/test.jpg"
            srcset="https://dictionary.cambridge.org/images/thumb/test-2x.jpg 2x"
          >
        </div>
      </section>
    `
    const entry = document.querySelector('section')!

    await inlineEntryImages([entry])

    const image = entry.querySelector('img')!
    expect(image.getAttribute('src')).toBe('data:image/jpeg;base64,AQID')
    expect(image.hasAttribute('srcset')).toBe(false)
    expect(getInnerHTML('https://dictionary.cambridge.org', entry)).toContain(
      'src="data:image/jpeg;base64,AQID"'
    )
  })

  it('should remove entry images when Cambridge returns a challenge', async () => {
    document.body.innerHTML = `
      <section>
        <div class="dimg">
          <img src="https://dictionary.cambridge.org/images/thumb/challenge.jpg">
          <div class="dimg_c">Image credit</div>
        </div>
      </section>
    `
    const entry = document.querySelector('section')!

    await inlineEntryImages([entry])

    expect(entry.querySelector('.dimg')).toBeNull()
  })
})
