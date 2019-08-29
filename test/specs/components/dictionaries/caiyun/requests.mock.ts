import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['I love you']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet('https://fanyi.caiyunapp.com')
    .reply(
      200,
      `<script type=text/javascript src=/static/js/app.777648be66595ff35e36.js> </script>`
    )

  mock
    .onGet(/caiyun.+\/js\/app\.\w+\.js/)
    .reply(
      200,
      `(t.headers['X-Authorization'] = 'token:cy4fgbil24jucmh8jfr5'), t)`
    )

  mock.onPost(/interpreter.+caiyun.+translator/).reply(200, {
    confidence: 0.8,
    target: '\u4eca\u591c\u6708\u8272\u5f88\u7f8e',
    isdict: 1,
    rc: 0
  })
}
