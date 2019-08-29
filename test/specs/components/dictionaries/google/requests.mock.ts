import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = [
  `It is what you read when you don't have to that determines what you will be when you can't help it.” \n― Oscar Wilde\nIt takes a long time to become an overnight success.`
]

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/translate\.google.+translate_a/)
    .reply(200, require('!raw-loader!./response/f.txt').default)

  mock
    .onGet(/translate\.google.+google/)
    .reply(200, require('!raw-loader!./response/homepage.html').default)
}
