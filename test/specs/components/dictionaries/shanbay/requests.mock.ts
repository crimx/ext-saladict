import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/shanbay/).reply(info => {
    return /mobile/.test(info.url || '')
      ? [200, require(`raw-loader!./response/love.html`).default]
      : [200, require(`./response/love.json`)]
  })
}
