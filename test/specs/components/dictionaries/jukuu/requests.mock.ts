import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/jukuu/)
    .reply(200, require(`raw-loader!./response/love.html`).default)
}
