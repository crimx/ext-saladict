import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['数字']

export const mockRequest: MockRequest = mock => {
  mock
  .onGet(/Special/)
  .reply(
    200,
    new DOMParser().parseFromString(
      require(`raw-loader!./response/langlist.html`).default,
      'text/html'
    )
  )
  
  mock
    .onGet(/m\.wikipedia/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/数字.html`).default,
        'text/html'
      )
    )
}
