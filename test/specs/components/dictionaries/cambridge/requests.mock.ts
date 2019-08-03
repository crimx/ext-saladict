import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['catch-zht', 'house-zhs', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/cambridge/).reply(info => {
    const doc = new DOMParser().parseFromString(
      require('raw-loader!./response/' +
        new URL(info.url!).searchParams.get('q') +
        '.html').default,
      'text/html'
    )
    return [200, doc]
  })
}
