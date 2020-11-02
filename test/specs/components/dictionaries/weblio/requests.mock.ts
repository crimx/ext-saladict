import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['主催', 'love', '吐く', '当たる']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/www\.weblio\.jp.+love/)
    .reply(200, require(`raw-loader!./response/love.html`).default)

  mock
    .onGet(new RegExp('www\\.weblio\\.jp.+' + encodeURIComponent('吐く')))
    .reply(200, require(`raw-loader!./response/吐く.html`).default)

  mock
    .onGet(new RegExp('www\\.weblio\\.jp.+' + encodeURIComponent('当たる')))
    .reply(200, require(`raw-loader!./response/当たる.html`).default)

  mock
    .onGet(new RegExp('www\\.weblio\\.jp.+' + encodeURIComponent('主催')))
    .reply(200, require(`raw-loader!./response/主催.html`).default)
}
