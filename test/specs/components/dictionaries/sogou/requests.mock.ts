import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['I love you']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/sogou.+js\/app/)
    .reply(
      200,
      `var y=d(""+a+c+n+"8954e2993f18dd83fd05e79bd6dd040e"),b={"from":a,"to":c,"text":n,"useDetect":"on","useDetectResult":"on","needQc":0,"uuid":f,"oxford":"on","isReturnSugg":"off","isStroke":"on","fr":"selection","s":y}`
    )
  mock
    .onGet('https://fanyi.sogou.com')
    .reply(
      200,
      `<script type=text/javascript src=//dlweb.sogoucdn.com/translate/pc/static/js/app.20daabb6.js></script>`
    )

  mock.onPost(/sogou/).reply(200, require('./response/i-love-you.json'))
}
