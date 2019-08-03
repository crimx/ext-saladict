import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/cnki/).reply(info => {
    const doc = new DOMParser().parseFromString(
      require('raw-loader!./response/' +
        new URL(info.url!).searchParams.get('searchword') +
        '.html').default,
      'text/html'
    )
    return [200, doc]
  })
}
