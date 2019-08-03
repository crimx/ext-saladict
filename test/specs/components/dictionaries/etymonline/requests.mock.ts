import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love-word', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/\/word\//).reply(info => {
    return /love-word/.test(info.url || '')
      ? [
          200,
          new DOMParser().parseFromString(
            require('raw-loader!./response/love-word.html').default,
            'text/html'
          )
        ]
      : [404]
  })

  mock.onGet(/\/search\?/).reply(info => {
    return /love-word/.test(info.url || '')
      ? [404]
      : [
          200,
          new DOMParser().parseFromString(
            require('raw-loader!./response/love-word.html').default,
            'text/html'
          )
        ]
  })
}
