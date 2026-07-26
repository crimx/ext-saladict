import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['catch-zht', 'house-zhs', 'love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/cambridge/).reply(info => {
    const url = new URL(info.url!)
    if (url.pathname === '/images/thumb/test.jpg') {
      return [
        200,
        new Uint8Array([1, 2, 3]).buffer,
        { 'content-type': 'image/jpeg' }
      ]
    }
    if (url.pathname === '/images/thumb/challenge.jpg') {
      return [200, '<html>challenge</html>', { 'content-type': 'text/html' }]
    }

    const query =
      url.searchParams.get('q') ||
      decodeURIComponent(
        url.pathname
          .split('/')
          .filter(Boolean)
          .pop() || ''
      )
    if (query === 'verify') {
      return [403]
    }

    const name = url.pathname.includes('/english-chinese-simplified/')
      ? query + '-zhs'
      : url.pathname.includes('/english-chinese-traditional/')
      ? query + '-zht'
      : query

    return [200, require('!raw-loader!./response/' + name + '.html').default]
  })
}
