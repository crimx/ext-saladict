import { retry } from '../helpers'
import { search } from '@/components/dictionaries/zdic/engine'
import { getDefaultConfig } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Zdic/engine', () => {
  beforeAll(() => {
    if (!process.env.CI) {
      const word = fs.readFileSync(path.join(__dirname, 'response/爱.html'), 'utf8')
      const phrase = fs.readFileSync(path.join(__dirname, 'response/沙拉.html'), 'utf8')
      window.fetch = jest.fn((url: string) => Promise.resolve({
        ok: true,
        text: () => url.indexOf('爱') !== -1 ? word : phrase
      }))
    }
  })

  it('should parse word result correctly', () => {
    return retry(() =>
      search('爱', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(({ result, audio }) => {
          expect(audio && typeof audio.py).toBe('string')
          expect(result.phsym.length).toBeGreaterThan(0)
          expect(typeof result.defs).toBe('string')
        })
    )
  })

  it('should parse phrase result correctly', () => {
    return retry(() =>
      search('沙拉', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(({ result, audio }) => {
          expect(audio && typeof audio.py).toBe('string')
          expect(result.phsym.length).toBeGreaterThan(0)
          expect(typeof result.defs).toBe('string')
        })
    )
  })
})
