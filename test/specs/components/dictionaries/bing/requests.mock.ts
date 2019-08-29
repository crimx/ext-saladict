import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', 'machine', 'related']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/bing\.com.+love$/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('!raw-loader!./response/lex.html').default,
        'text/html'
      )
    )

  mock
    .onGet(/bing\.com.+machine$/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('!raw-loader!./response/machine.html').default,
        'text/html'
      )
    )

  mock
    .onGet(/bing\.com.+related$/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('!raw-loader!./response/related.html').default,
        'text/html'
      )
    )
}
