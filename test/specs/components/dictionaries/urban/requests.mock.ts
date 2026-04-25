import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['love']

export const mockRequest: MockRequest = mock => {
  mock
    .onGet(/api\.urbandictionary\.com\/v0\/uncacheable/)
    .reply(200, {
      thumbs: [
        { defid: 16080433, up: 0, down: 0 },
        { defid: 13743256, up: 0, down: 0 },
        { defid: 15008163, up: 0, down: 0 },
        { defid: 8226418, up: 0, down: 0 },
        { defid: 17153859, up: 0, down: 0 },
        { defid: 14978230, up: 0, down: 0 },
        { defid: 7741756, up: 0, down: 0 }
      ]
    })
    .onGet(/www\.urbandictionary\.com\/define\.php/)
    .reply(200, require(`raw-loader!./response/love.html`).default)
}
