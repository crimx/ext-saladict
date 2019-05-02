import { retry } from '../helpers'
import { search } from '@/components/dictionaries/cnki/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import fs from 'fs'
import path from 'path'

describe('Dict/CNKI/engine', () => {
  beforeAll(() => {
    if (!process.env.CI) {
      const response = fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8')
      window.fetch = jest.fn((url: string) => Promise.resolve({
        ok: true,
        text: () => response
      }))
    }
  })

  it('should parse result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), { isPDF: false })
        .then(({ result, audio }) => {
          expect(audio).toBeUndefined()
          expect(result.dict.length).toBeGreaterThan(0)
          expect(result.senbi.length).toBeGreaterThan(0)
          expect(result.seneng.length).toBeGreaterThan(0)
        })
    )
  })
})
