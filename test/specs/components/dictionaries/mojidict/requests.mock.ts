import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['心']

export const mockRequest: MockRequest = mock => {
  mock
    .onPost(/mojidict.*fetchWord_v2/)
    .reply(200, require(`./response/心/fetchWord_v2.json`))
    .onPost(/mojidict.*search_v2/)
    .reply(200, require(`./response/心/search_v2.json`))
    .onPost(/mojidict.*fetchTts/)
    .reply(200, require(`./response/心/fetchTts.json`))
}
