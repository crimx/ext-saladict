import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/vocabulary/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/love.html`).default,
        'text/html'
      )
    )
}
