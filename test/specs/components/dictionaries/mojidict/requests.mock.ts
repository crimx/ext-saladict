import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['心']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/mojidict.*search\/all/)
    .reply(200, require(`./response/心/all.json`))
    .onGet(/mojidict.*word\/detailInfo/)
    .reply(200, require(`./response/心/detailInfo.json`))
    .onGet(/mojidict.*search\/example/)
    .reply(200, require(`./response/心/example.json`))
    .onGet(/mojidict.*search\/examQuestion/)
    .reply(200, require(`./response/心/examQuestion.json`))
    .onPost(/mojidict.*word\/related/)
    .reply(200, require(`./response/心/related.json`))
    .onPost(/mojidict.*tts-fetch/)
    .reply(200, require(`./response/心/fetchTts.json`))
}
