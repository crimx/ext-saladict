import { retry } from '../helpers'
import { search } from '@/components/dictionaries/naver/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/Naver/engine', () => {
  beforeAll(() => {
    if (!process.env.CI) {
      const response = {
        爱: fs.readFileSync(path.join(__dirname, 'response/爱.html'), 'utf8'),
        愛: fs.readFileSync(path.join(__dirname, 'response/愛.html'), 'utf8'),
      }

      window.fetch = jest.fn((url: string) => {
        const key = Object.keys(response).find(keyword => url.includes(keyword))
        if (key) {
          return Promise.resolve({
            ok: true,
            text: () => response[key]
          })
        }
        return Promise.reject(new Error(`Missing Response file for ${url}`))
      })
    }
  })

  it('should search zh dict', () => {
    return retry(() =>
      search('爱', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(searchResult => {
          expect(searchResult.result.lang).toBe('zh')
          expect(typeof searchResult.result.entry).toBe('string')
        })
    )
  })

  it('should search ja dict', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.naver.options.hanAsJa = true
    return retry(() =>
      search('愛', getDefaultConfig(), profile, { isPDF: false })
        .then(searchResult => {
          expect(searchResult.result.lang).toBe('ja')
          expect(typeof searchResult.result.entry).toBe('string')
        })
    )
  })
})
