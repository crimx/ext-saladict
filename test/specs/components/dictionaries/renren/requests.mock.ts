import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/91dict.+r_subs/)
    .reply(200, require(`raw-loader!./response/detail.html`).default)

  mock
    .onGet(/91dict/)
    .reply(200, require(`raw-loader!./response/love.html`).default)
}
