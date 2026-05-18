import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['test']

const html = `
  <div
    class="dictentry"
    data-type-block="English"
    data-title-block=""
    data-num-block=""
  >
    <span class="pron">
      <a class="audio_play_button" data-src-mp3="https://example.com/uk.mp3"></a>
    </span>
    <div class="def">definition</div>
  </div>
`

export const mockRequest: MockRequest = mock => {
  mock.onGet(/collinsdictionary\.com.*\/verify/).reply(403)

  mock.onGet(/collinsdictionary\.com\/zh/).reply(200, html)

  mock.onGet(/collinsdictionary/).reply(200, html)
}
