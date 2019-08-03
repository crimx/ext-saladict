import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['collin source', 'ciba source']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/collinsdictionary/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('raw-loader!./response/how.html').default,
        'text/html'
      )
    )

  mock
    .onGet(/iciba/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require('raw-loader!./response/love.html').default,
        'text/html'
      )
    )
}
