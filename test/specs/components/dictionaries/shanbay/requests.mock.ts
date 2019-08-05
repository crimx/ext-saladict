import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', 'jumblish']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/shanbay/).reply(info => {
    return /mobile/.test(info.url || '')
      ? [
          200,
          new DOMParser().parseFromString(
            require(`raw-loader!./response/love.html`).default,
            'text/html'
          )
        ]
      : [200, require(`./response/love.json`)]
  })
}
