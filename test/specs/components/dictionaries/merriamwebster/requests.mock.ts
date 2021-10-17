import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', 'text', 'salad']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/merriam-webster.+love$/)
    .reply(200, require(`raw-loader!./response/love.html`).default)

  mock
    .onGet(/merriam-webster.+text$/)
    .reply(200, require(`raw-loader!./response/text.html`).default)

  mock
    .onGet(/merriam-webster.+salad$/)
    .reply(200, require(`raw-loader!./response/salad.html`).default)
}
