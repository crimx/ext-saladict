import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock.onAny(/eudic/).reply(info => {
    const file = /tab-detail/.test(info.url || '') ? 'sentences' : 'love'
    return [
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/${file}.html`).default,
        'text/html'
      )
    ]
  })
}
