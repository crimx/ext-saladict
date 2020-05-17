import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', 'viral', 'jumblish']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/macmillan/).reply(info => {
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
