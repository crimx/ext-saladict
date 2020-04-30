import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['数字']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/wikipedia.+Special/)
    .reply(200, require(`raw-loader!./response/langlist.html`).default)

  mock
    .onGet(/m\.wikipedia/)
    .reply(200, require(`raw-loader!./response/数字.html`).default)
}
