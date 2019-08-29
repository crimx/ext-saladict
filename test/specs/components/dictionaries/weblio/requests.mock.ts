import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love', '吐く', '当たる']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/www\.weblio\.jp.+love/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/love.html`).default,
        'text/html'
      )
    )

  mock
    .onGet(new RegExp('www\\.weblio\\.jp.+' + encodeURIComponent('吐く')))
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/吐く.html`).default,
        'text/html'
      )
    )

  mock
    .onGet(new RegExp('www\\.weblio\\.jp.+' + encodeURIComponent('当たる')))
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/当たる.html`).default,
        'text/html'
      )
    )
}
