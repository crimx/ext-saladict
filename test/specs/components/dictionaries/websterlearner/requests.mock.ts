import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['door', 'house', 'jumblish']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/learnersdictionary/).reply(info => {
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
