import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['catch-zht', 'house-zhs', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/cambridge/).reply(info => {
    const url = new URL(info.url!)
    const query = url.searchParams.get('q')
    if (query === 'verify') {
      return [403]
    }

    const name = url.pathname.includes('/zhs/')
      ? query + '-zhs'
      : url.pathname.includes('/zht/')
      ? query + '-zht'
      : query

    return [
      200,
      require('!raw-loader!./response/' + name + '.html').default
    ]
  })
}
