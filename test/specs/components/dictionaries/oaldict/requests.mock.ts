import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['comment', 'love', 'salad']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/oxfordlearnersdictionaries.+comment$/)
    .reply(200, require('!raw-loader!./response/comment.html').default)

  mock
    .onGet(/oxfordlearnersdictionaries.+love$/)
    .reply(200, require('!raw-loader!./response/love.html').default)

  mock
    .onGet(/oxfordlearnersdictionaries.+salad$/)
    .reply(200, require('!raw-loader!./response/salad.html').default)
}
