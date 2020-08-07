import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['test']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/collinsdictionary\.com\/zh/)
    .reply(200, require('!raw-loader!./response/love.html').default)

  mock
    .onGet(/collinsdictionary/)
    .reply(200, require('!raw-loader!./response/how.html').default)
}
