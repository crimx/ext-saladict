import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['test']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/urbandictionary/)
    .reply(
      200,
      new DOMParser().parseFromString(
        require(`raw-loader!./response/test.html`).default,
        'text/html'
      )
    )
}
