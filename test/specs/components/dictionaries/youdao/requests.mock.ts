import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['make', 'love', 'translation', 'jumblish']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/youdao/).reply(info => {
    const wordMatch = /[^/]+$/.exec(info.url || '')
    if (!wordMatch) {
      return [404]
    }

    const word = decodeURIComponent(wordMatch[0])
    const file = /^She walks in beauty/.test(word) ? 'translation' : word
    return [200, require(`raw-loader!./response/${file}.html`).default]
  })
}
