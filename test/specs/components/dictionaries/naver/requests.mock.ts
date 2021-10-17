import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['爱', '愛']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(new RegExp('naver.+' + encodeURIComponent('爱')))
    .reply(200, require(`./response/爱.json`))

  mock
    .onGet(new RegExp('naver.+' + encodeURIComponent('愛')))
    .reply(200, require(`./response/愛.json`))
}
