import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', 'jumblish']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/macmillan/).reply(info => {
    const wordMatch = /[^\/]+$/.exec(info.url || '')
    return wordMatch
      ? [
          200,
          new DOMParser().parseFromString(
            require(`raw-loader!./response/${decodeURIComponent(
              wordMatch[0]
            )}.html`).default,
            'text/html'
          )
        ]
      : [404]
  })
}
