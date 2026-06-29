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
        ({ result, audio }) => {
          expect(result).toBeTruthy()

          if (result.type !== 'collins') {
            throw new Error('Expected Collins result')
          }

          expect(audio && audio.uk).toBeTruthy()
          expect(result.sections.map(section => section.type)).toContain(
            'Examples'
          )
          expect(result.sections.map(section => section.type)).toContain(
            'COBUILD'
          )
          expect(result.sections.map(section => section.type)).toContain(
            'Collins English Dictionary'
          )
          expect(result.sections.map(section => section.type)).toContain(
            'Penguin Dictionary'
          )

          const examples = result.sections.find(
            section => section.type === 'Examples'
          )!
          expect(examples.content).toContain("She'd have")
          expect(examples.content).toContain(
            'href="https://www.collinsdictionary.com/zh/dictionary/english/trouble"'
          )
          expect(examples.content).toContain('Jon Cleary')
          expect(examples.content).toContain("YESTERDAY'S SHADOW")
          expect(examples.content).toContain('2001')
          expect(examples.content).not.toContain("Examples of 'love'")
          expect(examples.content).not.toContain('包括 的例句')
          expect(examples.content).not.toContain(
            'These examples have been automatically selected'
          )
          expect(examples.content).not.toContain('这些示例已被自动选择')
          expect(examples.content).not.toContain('report an example sentence')
          expect(examples.content).not.toContain('Read more')
          expect(
            result.sections.find(section => section.type === 'Idioms')!.content
          ).toContain('cupboard love')
          expect(
            result.sections.find(section => section.type === 'Collocations')!
              .content
          ).toContain('abiding love')
          expect(
            result.sections.some(section =>
              /definition\.title\.type|Video pronunciation|Word lists|Word usage trends|Translations/.test(
                section.type + section.title
              )
            )
          ).toBe(false)
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
