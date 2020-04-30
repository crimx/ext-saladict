import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', 'profit', 'jumblish']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/ldoceonline/).reply(info => {
    const wordMatch = /[^/]+$/.exec(info.url || '')
    return wordMatch
      ? [
          200,
          require(`raw-loader!./response/${decodeURIComponent(
            wordMatch[0]
          )}.html`).default
        ]
      : [404]
  })
}
