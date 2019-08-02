import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['lex', 'machine', 'related']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/lex$/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('raw-loader!./response/lex.html').default,
        'text/html'
      )
    )

  mock
    .onGet(/machine$/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('raw-loader!./response/machine.html').default,
        'text/html'
      )
    )

  mock
    .onGet(/related$/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('raw-loader!./response/related.html').default,
        'text/html'
      )
    )
}
