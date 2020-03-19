import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['心']

export const mockRequest: MockRequest = mock => {
  mock
    .onPost(/mojidict.*fetchWord/)
    .reply(200, require(`./response/心/fetchWord.json`))
    .onPost(/mojidict.*search/)
    .reply(200, require(`./response/心/search.json`))
    .onPost(/mojidict.*fetchTts/)
    .reply(200, require(`./response/心/fetchTts.json`))
}
