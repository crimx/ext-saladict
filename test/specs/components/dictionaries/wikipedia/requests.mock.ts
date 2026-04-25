import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['数字']

export const mockRequest: MockRequest = mock => {
  mock.onGet(/wikipedia\.org\/w\/api\.php/).reply(200, getParseResponse())
}

function getParseResponse() {
  const html = require(`raw-loader!./response/数字.html`).default
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const content = doc.querySelector('#mw-content-text .mw-parser-output')
  const displaytitle = doc.querySelector('#firstHeading')?.innerHTML

  return {
    parse: {
      title: '數字',
      displaytitle,
      text: content?.outerHTML,
      langlinks: [
        {
          langname: '英语',
          title: 'Numerical digit',
          url: 'https://en.wikipedia.org/wiki/Numerical_digit'
        }
      ]
    }
  }
}
