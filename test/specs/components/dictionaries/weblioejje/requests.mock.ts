import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', '愛']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/love/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/love.html`).default,
        'text/html'
      )
    )

  mock
    .onGet(new RegExp(encodeURIComponent('愛')))
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/愛.html`).default,
        'text/html'
      )
    )
}
