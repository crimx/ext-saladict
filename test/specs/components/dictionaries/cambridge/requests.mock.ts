import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['catch-zht', 'house-zhs', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/cambridge/).reply(info => {
    return [
      200,
      require('!raw-loader!./response/' +
        new URL(info.url!).searchParams.get('q') +
        '.html').default
    ]
  })
}
