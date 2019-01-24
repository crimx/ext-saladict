import { search } from '@/components/dictionaries/cambridge/engine'
import { getDefaultConfig } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

const fetchbak = window.fetch

describe('Dict/Cambridge/engine', () => {
  beforeAll(() => {
    const response = {
      love: fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8'),
      house: fs.readFileSync(path.join(__dirname, 'response/house-zhs.html'), 'utf8'),
      catch: fs.readFileSync(path.join(__dirname, 'response/catch-zht.html'), 'utf8'),
    }

    window.fetch = jest.fn((url: string) => {
      const key = Object.keys(response).find(keyword => url.endsWith(keyword))
      if (key) {
        return Promise.resolve({
          ok: true,
          text: () => response[key]
        })
      }
      return Promise.reject(new Error(`Missing Response file for ${url}`))
    })
  })

  afterAll(() => {
    window.fetch = fetchbak
  })

  it('should parse result (en) correctly', () => {
    return search('love', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
      .then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result).toHaveLength(4)

        result.forEach(r => {
          expect(typeof r.title).toBe('string')
          expect(r.title).toBeTruthy()

          expect(typeof r.pos).toBe('string')
          expect(r.pos).toBeTruthy()

          expect(typeof r.defs).toBe('string')
          expect(r.defs).toBeTruthy()
        })

        expect(result[0].prons).toHaveLength(2)
        expect(result[1].prons).toHaveLength(2)
        expect(result[2].prons).toHaveLength(1)
        expect(result[3].prons).toHaveLength(1)
      })
  })

  it('should parse result (zhs) correctly', () => {
    return search('house', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
      .then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result).toHaveLength(2)

        result.forEach(r => {
          expect(typeof r.title).toBe('string')
          expect(r.title).toBeTruthy()

          expect(typeof r.pos).toBe('string')
          expect(r.pos).toBeTruthy()

          expect(typeof r.defs).toBe('string')
          expect(r.defs).toBeTruthy()
        })

        expect(result[0].prons).toHaveLength(4)
        expect(result[1].prons).toHaveLength(2)
      })
  })

  it('should parse result (zht) correctly', () => {
    return search('catch', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
      .then(({ result, audio }) => {
        expect(audio && typeof audio.uk).toBe('string')
        expect(audio && typeof audio.us).toBe('string')

        expect(result).toHaveLength(2)

        result.forEach(r => {
          expect(typeof r.title).toBe('string')
          expect(r.title).toBeTruthy()

          expect(typeof r.pos).toBe('string')
          expect(r.pos).toBeTruthy()

          expect(typeof r.defs).toBe('string')
          expect(r.defs).toBeTruthy()

          expect(r.prons).toHaveLength(2)
        })
      })
  })
})
