import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['how', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/collinsdictionary\.com.*\/verify$/).reply(403)

  mock.onGet(/collinsdictionary/).reply(info => {
    const wordMatch = /[^/]+$/.exec(info.url || '')
    if (!wordMatch) {
      return [404]
    }

    return [
      200,
      require(`raw-loader!./response/${decodeURIComponent(wordMatch[0])}.html`)
        .default
    ]
  })
}
