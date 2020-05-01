import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love-word', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/etymonline.+\/word\//).reply(info => {
    return /love-word/.test(info.url || '')
      ? [200, require('!raw-loader!./response/love-word.html').default]
      : [404]
  })

  mock.onGet(/etymonline.+\/search\?/).reply(info => {
    return /love-word/.test(info.url || '')
      ? [404]
      : [200, require('!raw-loader!./response/love-word.html').default]
  })
}
