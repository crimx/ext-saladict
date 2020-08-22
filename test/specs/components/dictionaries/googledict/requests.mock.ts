import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['salad', 'mouse', '爱', 'love']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/google.+(define|meaning).+mouse/)
    .reply(200, require('!raw-loader!./response/chs-mouse.html').default)

  mock
    .onGet(new RegExp(encodeURIComponent('爱')))
    .reply(200, require('!raw-loader!./response/chs-爱.html').default)

  mock
    .onGet(/google.+(define|meaning).+love/)
    .reply(200, require('!raw-loader!./response/en-love.html').default)

  mock
    .onGet(/google.+(define|meaning).+salad/)
    .reply(200, require('!raw-loader!./response/en-salad.html').default)
}
