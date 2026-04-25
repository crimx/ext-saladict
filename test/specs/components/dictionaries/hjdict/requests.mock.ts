import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['爱', 'love', 'henr']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/dict\.hujiang\.com/).reply(info => {
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
