import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['xswl']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/jikipedia/)
    .reply(200, require(`raw-loader!./response/xswl.html`).default)
}
