import { retry } from '../helpers'
import { search } from '@/components/dictionaries/weblioejje/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'

describe('Dict/Weblioejje/engine', () => {
  ;['love', '愛'].forEach(text => {
    it(`should parse result ${text} correctly`, () => {
      return retry(() =>
        search(text, getDefaultConfig(), getDefaultProfile(), {
          isPDF: false
        }).then(({ result }) => {
          expect(result.length).toBeGreaterThanOrEqual(1)
          for (const { content } of result) {
            expect(typeof content).toBe('string')
            expect(content.length).toBeGreaterThan(1)
          }
        })
      )
    })
  })

  it('should replace audio controls with static speakers', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result }) => {
        const content = result.map(({ content }) => content).join('')
        const audio =
          'https://cdn.weblio.jp/e7/img/dict/kenej/audio/S-A84EB96_E-A85070C.mp3'

        expect(content).toContain(`href="${audio}"`)
        expect(content).toContain('class="saladict-Speaker"')
        expect(content).not.toContain('contentTopAudioIcon')
        expect(content).not.toContain('<audio')
      })
    )
  })
})
